import {Module} from '@nestjs/common';

import {ScrapperModule} from '@scrapper/Scrapper.module';
import {ScrapperMetadataQueueDriver} from './drivers/DbQueue.driver';
import {
  SpiderService,
  SpiderQueueService,
} from './service';

@Module(
  {
    imports: [
      ScrapperModule,
    ],
    providers: [
      ScrapperMetadataQueueDriver,
      SpiderService,
      SpiderQueueService,
    ],
    exports: [
      SpiderService,
      SpiderQueueService,
    ],
  },
)
export class SpiderModule {}
