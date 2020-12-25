import * as R from 'ramda';
import chalk from 'chalk';
import {EntityRepository, SqlEntityManager} from '@mikro-orm/postgresql';
import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {InjectQueue} from '@nestjs/bull';

import {ID, IdentifiedItem} from '@shared/types';
import {paginatedAsyncIterator} from '@server/common/helpers/paginatedAsyncIterator';

import {WykopScrapper} from './scrappers';
import {WebsiteInfoScrapperService} from './WebsiteInfoScrapper.service';
import {
  INVALID_METADATA_FILTERS,
  ScrapperMetadataEntity,
  ScrapperMetadataStatus,
  ScrapperWebsiteEntity,
} from '../entity';

import {
  ScrapperBasicPagination,
  WebsiteScrapper,
  WebsiteScrapperItemInfo,
} from './shared';

import {
  DbLoaderQueue,
  SCRAPPER_METADATA_LOADER_QUEUE,
} from '../../metadata-db-loader/processors/MetadataDbLoaderConsumer.processor';

export type ScrapperAnalyzerStats = {
  updated: number,
  removed: number,
};

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  private scrappers: WebsiteScrapper[] = [
    new WykopScrapper,
  ];

  constructor(
    private readonly em: SqlEntityManager,
    private readonly websiteInfoScrapper: WebsiteInfoScrapperService,

    @InjectRepository(ScrapperMetadataEntity)
    private readonly metadataRepository: EntityRepository<ScrapperMetadataEntity>,

    @InjectQueue(SCRAPPER_METADATA_LOADER_QUEUE)
    private readonly dbLoaderQueue: DbLoaderQueue,
  ) {}

  /**
   * Wraps scrapper result into entity
   *
   * @static
   * @param {ScrapperWebsiteEntity} website
   * @param {IdentifiedItem} item
   * @param {ScrapperMetadataStatus} [status=ScrapperMetadataStatus.NEW]
   * @returns
   * @memberof ScrapperService
   */
  static scrapperResultToMetadataEntity(
    website: ScrapperWebsiteEntity,
    item: IdentifiedItem,
    status: ScrapperMetadataStatus = ScrapperMetadataStatus.NEW,
  ) {
    return new ScrapperMetadataEntity(
      {
        website,
        status,
        remoteId: +item.id,
        content: item,
      },
    );
  }

  /**
   * Find single scrapper by assigned website URL
   *
   * @param {string} url
   * @returns {WebsiteScrapper}
   * @memberof ScrapperService
   */
  getScrapperByWebsiteURL(url: string): WebsiteScrapper {
    return R.find(
      R.propEq('websiteURL', url) as any,
      this.scrappers,
    );
  }

  /**
   * Fetch all scrappers website
   *
   * @param {Object} params
   * @memberof ScrapperService
   */
  async refreshLatest(
    {
      maxIterations = 1,
    }: {
      maxIterations?: number,
    } = {},
  ) {
    const {scrappers} = this;

    for (const scrapper of scrappers) {
      await this.execScrapper(
        {
          maxIterations,
          scrapper,
        },
      );
    }
  }

  /**
   * Loads single
   *
   * @param {Object} params
   * @returns {Promise<boolean>}
   * @memberof ScrapperService
   */
  async refreshSingle(
    {
      remoteId,
      scrapper,
    }: {
      remoteId: ID,
      scrapper: WebsiteScrapper,
    },
  ): Promise<IdentifiedItem> {
    if (!scrapper)
      throw new Error('Missing scrapper!');

    const {
      em, websiteInfoScrapper,
      metadataRepository, dbLoaderQueue,
    } = this;

    const item = await scrapper.fetchSingle(remoteId);
    if (!item)
      return Promise.resolve(null);

    const website = await websiteInfoScrapper.findOrCreateWebsiteEntity(scrapper);
    const prevEntity = await metadataRepository.findOne(
      {
        remoteId: +remoteId,
      },
    );

    const updatedEntity = await (async () => {
      // update
      if (prevEntity) {
        metadataRepository.assign(
          prevEntity,
          {
            content: item,
          },
        );
        await metadataRepository.persistAndFlush(prevEntity);
        return prevEntity;
      }

      // create new
      const newEntity = ScrapperService.scrapperResultToMetadataEntity(website, item);
      await em.persistAndFlush(newEntity);
      return newEntity;
    })();

    // add job for processing entity
    await dbLoaderQueue.add(
      {
        metadataId: updatedEntity.id,
      },
    );

    return Promise.resolve(item);
  }

  /**
   * Iterates over database and reanalyzes data,
   * if review does not pass check, remove it
   *
   * @returns {Promise<ScrapperAnalyzerStats>}
   * @memberof ScrapperService
   */
  async reanalyze(): Promise<ScrapperAnalyzerStats> {
    const {em, metadataRepository} = this;
    const stats = {
      updated: 0,
      removed: 0,
    };

    const allRecordsIterator = paginatedAsyncIterator(
      {
        limit: 70,
        queryExecutor: ({limit, offset}) => (
          em
            .getRepository(ScrapperMetadataEntity)
            .findAll(['website'], null, limit, offset)
        ),
      },
    );

    for await (const [, page] of allRecordsIterator) {
      await em.transactional(() => {
        for (const item of page) {
          const scrapper = this.getScrapperByWebsiteURL(item.website.url);
          const parserInfo = scrapper.mapSingleItemResponse((item.content as WebsiteScrapperItemInfo).parserSource);

          if (parserInfo && !R.equals(parserInfo, item.content)) {
            stats.updated++;
            item.content = parserInfo;
          }
        }

        return Promise.resolve();
      });
    }

    stats.removed = await (async () => {
      const count = await metadataRepository.count({}, {filters: ['invalid']});

      /**
       * MikroORM is crashing when passing filters, use constants
       *
       * @see {@link https://github.com/mikro-orm/mikro-orm/issues/1236}
       * @todo Fixme
       */
      await metadataRepository.nativeDelete(INVALID_METADATA_FILTERS);

      return count;
    })();

    return stats;
  }

  /**
   * Saves already fetched scrapper results page
   *
   * @private
   * @param {Object} params
   * @returns
   * @memberof ScrapperService
   */
  private async storeScrappedPage(
    {
      website,
      scrappedPage,
    }: {
      website: ScrapperWebsiteEntity,
      scrappedPage: IdentifiedItem[],
    },
  ) {
    const {em, dbLoaderQueue} = this;
    const entities = await em.transactional(async (transaction) => {
      // detect which ids has been already scrapped
      const scrappedIds = R.pluck(
        'remoteId',
        await (
          transaction
            .createQueryBuilder(ScrapperMetadataEntity)
            .where(
              {
                remoteId: {
                  $in: R.pluck('id', scrappedPage),
                },
              },
            )
            .select(['remoteId'])
            .execute()
        ) as any[],
      );

      // create new metadata records
      return R.map(
        (item) => {
          if (R.includes(item.id, scrappedIds))
            return null;

          const entity = ScrapperService.scrapperResultToMetadataEntity(website, item);
          transaction.persist(entity);
          return entity;
        },
        scrappedPage,
      );
    });

    // load to database
    dbLoaderQueue.addBulk(
      entities
        .filter(Boolean)
        .map(
          ({id}) => ({
            data: {
              metadataId: id,
            },
          }),
        ),
    );
  }

  /*==================
   * Fetches data from single scrapper
   *
   * @param {Object} params
   * @memberof ScrapperService
   */
  async execScrapper<T extends WebsiteScrapper>(
    {
      maxIterations = 1,
      scrapper,
      initialPage,
    }: {
      scrapper: T,
      maxIterations?: number,
      initialPage?: ScrapperBasicPagination | string,
    },
  ) {
    const {logger, websiteInfoScrapper} = this;
    const website = await websiteInfoScrapper.findOrCreateWebsiteEntity(scrapper);

    // insert metadata
    let pageCounter = (
      typeof initialPage === 'string'
        ? null
        : initialPage?.page
    ) ?? 0;

    const iterator = scrapper.iterator(
      {
        maxIterations,
        initialPage: initialPage as any,
      },
    );

    for await (const scrappedPage of iterator) {
      logger.warn(
        `Scrapping ${++pageCounter} page of ${chalk.white(scrapper.websiteURL)} (items: ${scrappedPage.length})!`,
      );

      this.storeScrappedPage(
        {
          website,
          scrappedPage,
        },
      );
    }
  }
}
