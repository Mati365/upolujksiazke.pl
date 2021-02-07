import {Injectable} from '@nestjs/common';

import {concatUrls} from '@shared/helpers/concatUrls';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {CrawlerLink, CrawlerUrlQueueDriver} from '../crawlers/Crawler';
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
      async push(paths: CrawlerLink[]): Promise<void> {
        const dtos = paths.map(({url, priority}) => (
          new CreateSpiderQueueDto(
            {
              priority,
              processed: false,
              path: url,
              websiteId: website.id,
            },
          )
        ));

        await queueService.upsert(dtos);
      },

      async pop(): Promise<CrawlerLink> {
        const entity = await queueService.popFirstNotProcessedEntity(website.id);
        if (!entity)
          return null;

        return new CrawlerLink(
          concatUrls(website.url, entity.path),
          entity.priority,
        );
      },
    };
  }
}
