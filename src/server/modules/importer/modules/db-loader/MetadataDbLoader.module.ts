import {Module, forwardRef} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';

import {TagModule} from '@server/modules/tag';
import {BookModule} from '@server/modules/book/Book.module';

import {
  BookDbLoaderService,
  BookReviewDbLoaderService,
  UrlDbLoaderService,
} from '@importer/kinds/db-loaders';

import {
  MetadataDbLoaderService,
  MetadataDbLoaderQueueService,
} from './services';

import {
  SCRAPPER_METADATA_LOADER_QUEUE,
  MetadataDbLoaderConsumerProcessor,
} from './processors/MetadataDbLoaderConsumer.processor';

import {ScrapperModule} from '../scrapper/Scrapper.module';

@Module(
  {
    imports: [
      forwardRef(() => BookModule),
      ScrapperModule,
      TagModule,
      BullModule.registerQueue(
        {
          name: SCRAPPER_METADATA_LOADER_QUEUE,
          limiter: {
            max: 1,
            duration: 8000,
          },
        },
      ),
    ],
    providers: [
      MetadataDbLoaderConsumerProcessor,
      MetadataDbLoaderService,
      MetadataDbLoaderQueueService,
      UrlDbLoaderService,
      BookDbLoaderService,
      BookReviewDbLoaderService,
    ],
    exports: [
      UrlDbLoaderService,
      BookDbLoaderService,
      BookReviewDbLoaderService,
      MetadataDbLoaderService,
      MetadataDbLoaderQueueService,
    ],
  },
)
export class MetadataDbLoaderModule {}
