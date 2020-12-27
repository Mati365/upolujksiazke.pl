import * as R from 'ramda';
import chalk from 'chalk';
import pLimit from 'p-limit';
import {EntityRepository, SqlEntityManager} from '@mikro-orm/postgresql';
import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';

import {upsert} from '@server/common/helpers/db/upsert';

import {RemoteID, IdentifiedItem} from '@shared/types';
import {paginatedAsyncIterator} from '@server/common/helpers/paginatedAsyncIterator';

import {MetadataDbLoaderQueueService} from '../../metadata-db-loader/services';
import {WebsiteInfoScrapperService} from './WebsiteInfoScrapper.service';
import {
  INVALID_METADATA_FILTERS,
  ScrapperMetadataEntity,
  ScrapperMetadataKind,
  ScrapperMetadataStatus,
  ScrapperWebsiteEntity,
} from '../entity';

import {
  ScrapperBasicPagination,
  WebsiteScrapperItemInfo,
  WebsiteScrappersGroup,
} from './shared';

import {WykopScrappersGroup} from './scrappers';

export type ScrapperAnalyzerStats = {
  updated: number,
  removed: number,
};

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);
  private readonly analyzerRecordsPageSize = 100;

  private scrappersGroups: WebsiteScrappersGroup[] = [
    new WykopScrappersGroup,
  ];

  constructor(
    private readonly em: SqlEntityManager,
    private readonly websiteInfoScrapperService: WebsiteInfoScrapperService,
    private readonly dbLoaderQueueService: MetadataDbLoaderQueueService,

    @InjectRepository(ScrapperMetadataEntity)
    private readonly metadataRepository: EntityRepository<ScrapperMetadataEntity>,
  ) {}

  /**
   * Wraps scrapper result into entity
   *
   * @static
   * @param {ScrapperWebsiteEntity} website
   * @param {IdentifiedItem<RemoteID>} item
   * @param {ScrapperMetadataStatus} [status=ScrapperMetadataStatus.NEW]
   * @returns
   * @memberof ScrapperService
   */
  static scrapperResultToMetadataEntity(
    website: ScrapperWebsiteEntity,
    item: WebsiteScrapperItemInfo,
    status: ScrapperMetadataStatus = ScrapperMetadataStatus.NEW,
  ) {
    return new ScrapperMetadataEntity(
      {
        website,
        status,
        remoteId: R.toString(item.id),
        content: item,
      },
    );
  }

  /**
   * Find single scrapper by assigned website URL
   *
   * @param {string} url
   * @returns {WebsiteScrappersGroup}
   * @memberof ScrapperService
   */
  getScrappersGroupByWebsiteURL(url: string): WebsiteScrappersGroup {
    return R.find(
      (scrapper) => scrapper.websiteURL === url,
      this.scrappersGroups,
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
      kind,
    }: {
      maxIterations?: number,
      kind: ScrapperMetadataKind,
    },
  ) {
    if (!kind)
      throw new Error('Missing kind!');

    const {scrappersGroups} = this;
    const limit = pLimit(2);

    return Promise.all(
      scrappersGroups.map(
        (scrappersGroup) => limit(() => this.execScrapper(
          {
            maxIterations,
            scrappersGroup,
            kind,
          },
        )),
      ),
    );
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
      scrappersGroup,
      kind,
    }: {
      remoteId: RemoteID,
      scrappersGroup: WebsiteScrappersGroup,
      kind: ScrapperMetadataKind,
    },
  ): Promise<IdentifiedItem> {
    if (!scrappersGroup)
      throw new Error('Missing scrappers group!');

    if (!kind)
      throw new Error('Missing kind!');

    const {
      websiteInfoScrapperService,
      metadataRepository,
      dbLoaderQueueService,
    } = this;

    const item: WebsiteScrapperItemInfo = await scrappersGroup.scrappers[kind].fetchSingle(remoteId);
    if (!item)
      return Promise.resolve(null);

    const website = await websiteInfoScrapperService.findOrCreateWebsiteEntity(scrappersGroup.websiteInfoScrapper);
    const updatedEntity = await upsert(
      {
        repository: metadataRepository,
        data: ScrapperService.scrapperResultToMetadataEntity(website, item),
        where: {
          remoteId,
        },
      },
    );

    // add job for processing entity
    await dbLoaderQueueService.addMetadataToQueue(updatedEntity);
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
    const {
      em,
      metadataRepository,
      dbLoaderQueueService,
      analyzerRecordsPageSize,
    } = this;

    const stats = {
      updated: 0,
      removed: 0,
    };

    const allRecordsIterator = paginatedAsyncIterator(
      {
        limit: analyzerRecordsPageSize,
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
          const scrappersGroup = this.getScrappersGroupByWebsiteURL(item.website.url);
          const parserInfo = (
            scrappersGroup[item.kind].mapSingleItemResponse((item.content as WebsiteScrapperItemInfo).parserSource)
          );

          if (parserInfo) {
            stats.updated++;
            item.content = parserInfo;
          }
        }

        return Promise.resolve();
      });

      // load to database
      await dbLoaderQueueService.addBulkMetadataToQueue(page);
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
      scrappedPage: WebsiteScrapperItemInfo[],
    },
  ) {
    const {em, dbLoaderQueueService} = this;
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
                  $in: R.pluck('id', scrappedPage).map(R.toString),
                },
              },
            )
            .select(['remoteId'])
            .execute()
        ) as any[],
      );

      // create new metadata records
      return (
        R
          .map(
            (item) => {
              if (R.includes(R.toString(item.id), scrappedIds))
                return null;

              const entity = ScrapperService.scrapperResultToMetadataEntity(website, item);
              transaction.persist(entity);
              return entity;
            },
            scrappedPage,
          )
          .filter(Boolean)
      );
    });

    // load to database
    if (entities.length)
      await dbLoaderQueueService.addBulkMetadataToQueue(entities);
  }

  /**
   * Fetches data from single scrapper
   *
   * @param {Object} params
   * @memberof ScrapperService
   */
  async execScrapper(
    {
      maxIterations = 1,
      scrappersGroup,
      initialPage,
      kind,
    }: {
      scrappersGroup: WebsiteScrappersGroup,
      maxIterations?: number,
      initialPage?: ScrapperBasicPagination | string,
      kind: ScrapperMetadataKind,
    },
  ) {
    const {logger, websiteInfoScrapperService} = this;
    const website = await websiteInfoScrapperService.findOrCreateWebsiteEntity(scrappersGroup.websiteInfoScrapper);

    // insert metadata
    let pageCounter = (
      typeof initialPage === 'string'
        ? null
        : initialPage?.page
    ) ?? 0;

    const iterator = scrappersGroup.scrappers[kind].iterator(
      {
        maxIterations,
        initialPage: initialPage as any,
      },
    );

    for await (const scrappedPage of iterator) {
      logger.warn(
        `Scrapping ${++pageCounter} page of ${chalk.white(scrappersGroup.websiteURL)} (items: ${scrappedPage.length})!`,
      );

      await this.storeScrappedPage(
        {
          website,
          scrappedPage,
        },
      );
    }
  }
}
