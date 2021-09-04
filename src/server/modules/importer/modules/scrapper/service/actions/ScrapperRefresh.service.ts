import * as R from 'ramda';
import chalk from 'chalk';
import pMap from 'p-map';
import {Injectable, Logger} from '@nestjs/common';
import {Connection, Equal, In} from 'typeorm';

import {upsert} from '@server/common/helpers/db/upsert';
import {safeToString} from '@shared/helpers/safeToString';

import {RemoteID, IdentifiedItem} from '@shared/types';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {
  MetadataDbLoaderQueueService,
  MetadataDbLoaderService,
} from '@importer/modules/db-loader/services';

import {SentryService} from '@server/modules/sentry/Sentry.service';
import {WebsiteInfoScrapperService} from '../scrappers/WebsiteInfoScrapper';
import {ScrapperMetadataService} from '../ScrapperMetadata.service';
import {ScrapperService} from '../Scrapper.service';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../entity';
import {
  WebsiteScrapperItemInfo,
  WebsiteScrappersGroup,
} from '../shared';

@Injectable()
export class ScrapperRefreshService {
  private readonly logger = new Logger(ScrapperRefreshService.name);

  constructor(
    private readonly connection: Connection,
    private readonly websiteInfoScrapperService: WebsiteInfoScrapperService,
    private readonly metadataDbLoaderService: MetadataDbLoaderService,
    private readonly dbLoaderQueueService: MetadataDbLoaderQueueService,
    private readonly scrapperService: ScrapperService,
    private readonly sentryService: SentryService,
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
              : ScrapperMetadataService.scrapperResultToMetadataEntity(website, item)
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
      initialPage?: any,
      kind: ScrapperMetadataKind,
    },
  ) {
    if (!scrappersGroup)
      throw new Error('Unknown scrappersGroup provided to scrapper executor!');

    const {logger, websiteInfoScrapperService} = this;
    const website = await websiteInfoScrapperService.findOrCreateWebsiteEntity(scrappersGroup.websiteInfoScrapper);

    // insert metadata
    let pageCounter = +initialPage || 0;
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
    const {
      sentryService,
      logger,
      scrapperService,
    } = this;

    kind ??= ScrapperMetadataKind.URL;
    scrappersGroups ??= scrapperService.scrappersGroups;

    await pMap(
      scrappersGroups,
      async (scrappersGroup) => {
        try {
          await this.execScrapper(
            {
              maxIterations,
              scrappersGroup,
              kind,
            },
          );
        } catch (e) {
          logger.error(e);
          sentryService.instance.captureException(e);
        }
      },
      {
        concurrency: 2,
      },
    );
  }

  /**
   * Loads single
   *
   * @todo
   *  Do not bloat scrapper metadata with urls!
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
      queued = true,
    }: {
      remoteId: RemoteID,
      scrappersGroup: WebsiteScrappersGroup,
      kind: ScrapperMetadataKind,
      queued?: boolean,
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
      metadataDbLoaderService,
      websiteInfoScrapperService,
    } = this;

    const website = await websiteInfoScrapperService.findOrCreateWebsiteEntity(scrappersGroup.websiteInfoScrapper);
    const newEntity = ScrapperMetadataService.scrapperResultToMetadataEntity(website, item);
    const updatedEntity = await upsert(
      {
        connection,
        Entity: ScrapperMetadataEntity,
        constraint: 'scrapper_metadata_unique_remote',
        data: newEntity,
        coalesce: false,
      },
    );

    if (queued)
      await dbLoaderQueueService.addMetadataToQueue(updatedEntity);
    else
      await metadataDbLoaderService.extractMetadataToDb(<any> updatedEntity);

    return updatedEntity;
  }

  /**
   * Refreshes all websites
   *
   * @memberof ScrapperRefreshService
   */
  async refreshWebsites() {
    const {
      websiteInfoScrapperService,
      scrapperService,
    } = this;

    return websiteInfoScrapperService.findOrCreateWebsitesEntities(
      R
        .pluck('websiteInfoScrapper', scrapperService.scrappersGroups)
        .filter(Boolean),
      true,
    );
  }
}
