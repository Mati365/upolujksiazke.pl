import * as R from 'ramda';
import chalk from 'chalk';
import pLimit from 'p-limit';
import {Injectable, Logger} from '@nestjs/common';
import {Connection, Equal, In} from 'typeorm';

import {upsert} from '@server/common/helpers/db/upsert';

import {RemoteID, IdentifiedItem} from '@shared/types';
import {RemoteRecordEntity, RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {MetadataDbLoaderQueueService} from '@server/modules/importer/modules/db-loader/services';

import {WebsiteInfoScrapperService} from '../WebsiteInfoScrapper.service';
import {ScrapperBasicPagination, WebsiteScrapperItemInfo, WebsiteScrappersGroup} from '../shared';
import {ScrapperService} from '../Scrapper.service';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../entity';

@Injectable()
export class ScrapperRefreshService {
  private readonly logger = new Logger(ScrapperRefreshService.name);

  constructor(
    private readonly connection: Connection,
    private readonly websiteInfoScrapperService: WebsiteInfoScrapperService,
    private readonly dbLoaderQueueService: MetadataDbLoaderQueueService,
    private readonly scrapperService: ScrapperService,
  ) {}

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
      website: RemoteWebsiteEntity,
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
      await RemoteRecordEntity.find(
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

    const {scrappersGroups} = this.scrapperService;
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
    const updatedEntity = await connection.transaction(async (transaction) => {
      const newEntity = ScrapperService.scrapperResultToMetadataEntity(website, item);
      await upsert(
        {
          connection,
          entityManager: transaction,
          Entity: RemoteRecordEntity,
          constraint: 'unique_remote_entry',
          data: newEntity.remote,
        },
      );

      return upsert(
        {
          connection,
          entityManager: transaction,
          Entity: ScrapperMetadataEntity,
          primaryKey: ['remoteId'],
          data: newEntity,
        },
      );
    });

    await dbLoaderQueueService.addMetadataToQueue(updatedEntity);
    return updatedEntity;
  }
}
