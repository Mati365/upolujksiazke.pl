import {Injectable} from '@nestjs/common';

import {concatUrls} from '@shared/helpers/concatUrls';
import {extractPathname} from '@shared/helpers/urlExtract';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {CrawlerUrlQueueDriver} from '../crawlers/Crawler';
import {CreateSpiderQueueDto} from '../dto/CreateSpiderQueue.dto';
import {SpiderQueueService} from '../service/SpiderQueue.service';

type QueueCreateAttrs = {
  website: RemoteWebsiteEntity,
};

@Injectable()
export class ScrapperMetadataQueueDriver {
  constructor(
    private readonly queueService: SpiderQueueService,
  ) {}

  /**
   * Creates object that implements crawler queue interface
   *
   * @param {QueueCreateAttrs} attrs
   * @returns {CrawlerUrlQueueDriver}
   * @memberof ScrapperMetadataQueueDriver
   */
  createQueue({website}: QueueCreateAttrs): CrawlerUrlQueueDriver {
    const {queueService} = this;

    return {
      async push(url: string): Promise<void> {
        await queueService.upsert(
          [
            new CreateSpiderQueueDto(
              {
                processed: false,
                websiteId: website.id,
                path: extractPathname(url),
              },
            ),
          ],
        );
      },

      async pop(): Promise<string> {
        const entity = await queueService.getFirstNotProcessedEntity(website.id);

        return concatUrls(
          website.url,
          entity?.path,
        );
      },
    };
  }
}
