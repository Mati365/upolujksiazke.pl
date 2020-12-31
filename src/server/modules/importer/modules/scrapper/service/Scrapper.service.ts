import * as R from 'ramda';
import chalk from 'chalk';
import pLimit from 'p-limit';
import {Injectable, Logger} from '@nestjs/common';
import {Connection, Equal, In} from 'typeorm';

import {upsert} from '@server/common/helpers/db/upsert';
import {ENV} from '@server/constants/env';

import {RemoteID, IdentifiedItem} from '@shared/types';
import {paginatedAsyncIterator} from '@server/common/helpers/paginatedAsyncIterator';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {MetadataDbLoaderQueueService} from '../../metadata-db-loader/services';
import {WebsiteInfoScrapperService} from './WebsiteInfoScrapper.service';
import {
  ScrapperMetadataEntity,
  ScrapperMetadataKind,
  ScrapperMetadataStatus,
  ScrapperRemoteEntity,
  ScrapperWebsiteEntity,
} from '../entity';

import {
  ScrapperBasicPagination,
  WebsiteScrapperItemInfo,
  WebsiteScrappersGroup,
} from './shared';

import {
  EIsbnScrappersGroup,
  WykopScrappersGroup,
} from './scrappers';

const {parsers: PARSERS_ENV} = ENV.server;

export type ScrapperAnalyzerStats = {
  updated: number,
  removed: number,
};

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);
  private readonly analyzerRecordsPageSize = 100;
  private scrappersGroups: WebsiteScrappersGroup[] = null;

  constructor(
    private readonly connection: Connection,
    private readonly websiteInfoScrapperService: WebsiteInfoScrapperService,
    private readonly dbLoaderQueueService: MetadataDbLoaderQueueService,
    tmpDirService: TmpDirService,
  ) {
    this.scrappersGroups = [
      new WykopScrappersGroup(PARSERS_ENV.wykop),
      new EIsbnScrappersGroup(
        {
          ...PARSERS_ENV.eisbn,
          tmp: {
            ...PARSERS_ENV.eisbn.tmp,
            dirService: tmpDirService,
          },
        },
      ),
    ];
  }

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
        status,
        content: item,
        remote: new ScrapperRemoteEntity(
          {
            remoteId: R.toString(item.id),
            websiteId: website.id,
          },
        ),
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

    const item: WebsiteScrapperItemInfo = await scrappersGroup.scrappers[kind].fetchSingle(remoteId);
    if (!item)
      return Promise.resolve(null);

    const {
      connection,
      dbLoaderQueueService,
      websiteInfoScrapperService,
    } = this;

    const website = await websiteInfoScrapperService.findOrCreateWebsiteEntity(scrappersGroup.websiteInfoScrapper);
    const updatedEntity = await connection.transaction(async () => {
      const newEntity = ScrapperService.scrapperResultToMetadataEntity(website, item);
      await upsert(
        {
          connection,
          Entity: ScrapperRemoteEntity,
          constraint: 'unique_remote_entry',
          data: newEntity.remote,
        },
      );

      return upsert(
        {
          connection,
          Entity: ScrapperMetadataEntity,
          primaryKey: ['remoteId'],
          data: newEntity,
        },
      );
    });

    await dbLoaderQueueService.addMetadataToQueue(updatedEntity);
    return updatedEntity;
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
      connection,
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
        queryExecutor: ({limit, offset}) => ScrapperMetadataEntity.find(
          {
            relations: ['remote', 'remote.website'],
            skip: offset,
            take: limit,
          },
        ),
      },
    );

    for await (const [, page] of allRecordsIterator) {
      await connection.transaction(async (transaction) => {
        for (const item of page) {
          const scrappersGroup = this.getScrappersGroupByWebsiteURL(item.remote.website.url);
          const parserInfo = (
            scrappersGroup
              .scrappers[item.kind]
              .mapSingleItemResponse((item.content as WebsiteScrapperItemInfo).parserSource)
          );

          if (parserInfo) {
            stats.updated++;
            await transaction.getRepository(ScrapperMetadataEntity).update(
              item.id,
              new ScrapperMetadataEntity(
                {
                  content: parserInfo,
                },
              ),
            );
          }
        }
      });

      // load to database
      await dbLoaderQueueService.addBulkMetadataToQueue(page);
    }

    stats.removed = await (async () => {
      const count = await ScrapperMetadataEntity.inactive.getCount();
      await ScrapperMetadataEntity.inactive.delete().execute();

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
    const {
      connection,
      dbLoaderQueueService,
    } = this;

    // detect which ids has been already scrapped
    const scrappedIds = R.pluck(
      'remoteId',
      await ScrapperRemoteEntity.find(
        {
          where: {
            websiteId: Equal(website.id),
            remoteId: In(R.pluck('id', scrappedPage).map(R.toString)),
          },
        },
      ),
    );

    // create new metadata records
    const metadataEntities = (
      R
        .map(
          (item) => (
            R.includes(R.toString(item.id), scrappedIds)
              ? null
              : ScrapperService.scrapperResultToMetadataEntity(website, item)
          ),
          scrappedPage,
        )
        .filter(Boolean)
    );

    // load to database
    if (metadataEntities.length) {
      await connection.transaction(async (transaction) => {
        await transaction.save(R.pluck('remote', metadataEntities));
        await transaction.save(metadataEntities);
      });

      await dbLoaderQueueService.addBulkMetadataToQueue(metadataEntities);
    }
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

    const iterator = scrappersGroup.scrappers[kind]?.iterator(
      {
        maxIterations,
        initialPage: initialPage as any,
      },
    );

    if (!iterator)
      return;

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
