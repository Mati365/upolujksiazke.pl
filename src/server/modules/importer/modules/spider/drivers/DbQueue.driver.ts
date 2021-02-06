import {Injectable} from '@nestjs/common';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {CrawlerUrlQueueDriver} from '../crawlers/Crawler';
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
  createQueue(attrs: QueueCreateAttrs): CrawlerUrlQueueDriver {
    console.info(attrs);

    return {
      push(url: string): Promise<void> {
        console.info(url);
        throw new Error('Method not implemented.');
      },

      pop(): Promise<string> {
        throw new Error('Method not implemented.');
      },
    };
  }
}
