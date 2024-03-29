import {Injectable} from '@nestjs/common';

import {concatUrls} from '@shared/helpers/concatUrls';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {CrawlerLink, CrawlerUrlQueueDriver} from '../crawlers/Crawler';
import {CreateSpiderQueueDto} from '../dto/CreateSpiderQueue.dto';
import {SpiderQueueService} from '../service/SpiderQueue.service';

type QueueCreateAttrs = {
  website: RemoteWebsiteEntity,
};

export interface WebsiteQueueDriver extends CrawlerUrlQueueDriver {
  website: RemoteWebsiteEntity;
}

@Injectable()
export class ScrapperMetadataQueueDriver {
  constructor(
    private readonly queueService: SpiderQueueService,
  ) {}

  /**
   * Creates object that implements crawler queue interface
   *
   * @param {QueueCreateAttrs} attrs
   * @returns {WebsiteQueueDriver}
   * @memberof ScrapperMetadataQueueDriver
   */
  createWebsiteIndexedQueue({website}: QueueCreateAttrs): WebsiteQueueDriver {
    const {queueService} = this;

    return {
      website,

      async push(paths: CrawlerLink[]): Promise<void> {
        const dtos = paths.map(({url, processed, priority}) => (
          new CreateSpiderQueueDto(
            {
              priority,
              processed,
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
