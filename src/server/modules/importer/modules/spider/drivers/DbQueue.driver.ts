import {Injectable} from '@nestjs/common';

import {concatUrls} from '@shared/helpers/concatUrls';

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
  createIndexedQueue({website}: QueueCreateAttrs): CrawlerUrlQueueDriver {
    const {queueService} = this;

    return {
      async push(paths: string[]): Promise<void> {
        const dtos = paths.map((path) => (
          new CreateSpiderQueueDto(
            {
              processed: false,
              websiteId: website.id,
              path,
            },
          )
        ));

        await queueService.upsert(dtos);
      },

      async pop(): Promise<string> {
        const entity = await queueService.popFirstNotProcessedEntity(website.id);
        if (!entity)
          return null;

        return concatUrls(website.url, entity?.path);
      },
    };
  }
}
