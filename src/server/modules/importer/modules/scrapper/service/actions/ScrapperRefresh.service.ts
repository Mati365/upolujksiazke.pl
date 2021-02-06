import * as R from 'ramda';
import chalk from 'chalk';
import pLimit from 'p-limit';
import {Injectable, Logger} from '@nestjs/common';
import {Connection, Equal, In} from 'typeorm';

import {upsert} from '@server/common/helpers/db/upsert';
import {safeToString} from '@shared/helpers/safeToString';

import {RemoteID, IdentifiedItem} from '@shared/types';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
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
    const {dbLoaderQueueService} = this;

    // detect which ids has been already scrapped
    const scrappedIds = R.pluck(
      'remoteId',
      await ScrapperMetadataEntity.find(
        {
          where: {
            websiteId: Equal(website.id),
            remoteId: In(R.pluck('remoteId', scrappedPage).map(safeToString)),
          },
        },
      ),
    );

    // create new metadata records
    const metadataEntities = (
      R
        .map(
          (item) => (
            R.includes(safeToString(item.remoteId), scrappedIds)
              ? null
              : ScrapperService.scrapperResultToMetadataEntity(website, item)
          ),
          scrappedPage,
        )
        .filter(Boolean)
    );

    // load to database
    if (metadataEntities.length) {
      await ScrapperMetadataEntity.save(metadataEntities);
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
      scrappersGroups,
    }: {
      maxIterations?: number,
      kind: ScrapperMetadataKind,
      scrappersGroups?: WebsiteScrappersGroup[],
    },
  ) {
    kind ??= ScrapperMetadataKind.URL;
    scrappersGroups ??= this.scrapperService.scrappersGroups;

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
    kind ??= ScrapperMetadataKind.URL;

    if (!scrappersGroup)
      throw new Error('Missing scrappers group!');

    const item: WebsiteScrapperItemInfo = await scrappersGroup.scrappers[kind].fetchSingle(remoteId);
    if (!item)
      return Promise.resolve(null);

    const {
      connection,
      dbLoaderQueueService,
      websiteInfoScrapperService,
    } = this;

    const website = await websiteInfoScrapperService.findOrCreateWebsiteEntity(scrappersGroup.websiteInfoScrapper);
    const newEntity = ScrapperService.scrapperResultToMetadataEntity(website, item);
    const updatedEntity = await upsert(
      {
        connection,
        Entity: ScrapperMetadataEntity,
        constraint: 'scrapper_metadata_unique_remote',
        data: newEntity,
      },
    );

    await dbLoaderQueueService.addMetadataToQueue(updatedEntity);
    return updatedEntity;
  }
}
