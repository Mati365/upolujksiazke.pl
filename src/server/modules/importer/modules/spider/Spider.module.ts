import {Module} from '@nestjs/common';

import {ScrapperModule} from '@scrapper/Scrapper.module';
import {MetadataDbLoaderModule} from '../db-loader/MetadataDbLoader.module';
import {ScrapperMetadataQueueDriver} from './drivers/DbQueue.driver';
import {
  SpiderService,
  SpiderQueueService,
} from './service';

@Module(
  {
    imports: [
      MetadataDbLoaderModule,
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
