import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {paginatedAsyncIterator} from '@server/common/helpers';

import {MetadataDbLoaderQueueService} from '@server/modules/importer/modules/db-loader/services';
import {WebsiteScrapperItemInfo} from '../shared';
import {ScrapperMetadataEntity} from '../../entity';
import {
  ScrapperAnalyzerStats,
  ScrapperService,
} from '../Scrapper.service';

@Injectable()
export class ScrapperReanalyzerService {
  private readonly analyzerRecordsPageSize = 100;

  constructor(
    private readonly connection: Connection,
    private readonly scrapperService: ScrapperService,
    private readonly dbLoaderQueueService: MetadataDbLoaderQueueService,
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
      scrapperService,
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
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      await connection.transaction(async (transaction) => {
        for (const item of page) {
          const scrappersGroup = scrapperService.getScrappersGroupByWebsiteURL(item.remote.website.url);
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
}
