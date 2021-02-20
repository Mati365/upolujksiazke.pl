import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {paginatedAsyncIterator} from '@server/common/helpers/db';

import {IdentifiedItem, RemoteID} from '@shared/types';
import {MetadataDbLoaderQueueService} from '@importer/modules/db-loader/services';
import {WebsiteScrapperItemInfo} from '../shared/AsyncScrapper';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../entity';
import {ScrapperService} from '../Scrapper.service';
import {ScrapperMetadataService} from '../ScrapperMetadata.service';
import {WebsiteScrappersGroup} from '../shared/WebsiteScrappersGroup';

export type ScrapperAnalyzerStats = {
  updated: number,
  removed: number,
};

@Injectable()
export class ScrapperReanalyzerService {
  private readonly analyzerRecordsPageSize = 100;

  constructor(
    private readonly connection: Connection,
    private readonly scrapperService: ScrapperService,
    private readonly dbLoaderQueueService: MetadataDbLoaderQueueService,
    private readonly scrapperMetadataService: ScrapperMetadataService,
  ) {}

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
      scrapperService,
      scrapperMetadataService,
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
            relations: ['website'],
            skip: offset,
            take: limit,
          },
        ),
      },
    );

    for await (const [, page] of allRecordsIterator) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      await connection.transaction(async (transaction) => {
        for (const item of page) {
          const scrappersGroup = scrapperService.getScrappersGroupByWebsiteURL(item.website.url);

          stats.updated++;
          item.content = (
            <WebsiteScrapperItemInfo> scrappersGroup
              .scrappers[item.kind]
              .mapSingleItemResponse(item.parserSource)
          )?.dto;

          await transaction.save(item);
        }
      });

      // load to database
      await dbLoaderQueueService.addBulkMetadataToQueue(page);
    }

    stats.removed = await scrapperMetadataService.deleteAndCountDeleted();
    return stats;
  }

  /**
   * Reassign object content
   *
   * @param {Object} attrs
   * @returns {Promise<IdentifiedItem>}
   * @memberof ScrapperReanalyzerService
   */
  async reanalyzeSingle(
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
    const {dbLoaderQueueService} = this;
    const item = await ScrapperMetadataEntity.findOne(
      {
        remoteId,
        kind,
      },
    );

    if (!item)
      throw new Error(`Missing item (RemoteID: ${remoteId}, Kind: ${kind})!`);

    item.content = (
      <WebsiteScrapperItemInfo> scrappersGroup
        .scrappers[item.kind]
        .mapSingleItemResponse(item.parserSource)
    )?.dto;

    await dbLoaderQueueService.addMetadataToQueue(
      await ScrapperMetadataEntity.save(item),
    );

    return item;
  }
}
