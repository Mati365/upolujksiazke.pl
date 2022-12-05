import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';

import {SERVER_ENV} from '@server/constants/env';

import {TagModule} from '@server/modules/tag/Tag.module';
import {BookModule} from '@server/modules/book/Book.module';
import {BrochureModule} from '@server/modules/brochure/Brochure.module';

import {
  BookDbLoaderService,
  BookReviewDbLoaderService,
  BookSummaryDbLoaderService,
  BookImportedListener,
  UrlDbLoaderService,
  BrochureDbLoaderService,
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
      BookModule,
      BrochureModule,
      ScrapperModule,
      TagModule,
      BullModule.registerQueue(
        {
          redis: SERVER_ENV.redisConfig,
          name: SCRAPPER_METADATA_LOADER_QUEUE,
          limiter: {
            max: 1,
            duration: 5000,
          },
        },
      ),
    ],
    providers: [
      MetadataDbLoaderConsumerProcessor,
      MetadataDbLoaderService,
      MetadataDbLoaderQueueService,
      UrlDbLoaderService,
      BookImportedListener,
      BookDbLoaderService,
      BookSummaryDbLoaderService,
      BookReviewDbLoaderService,
      BrochureDbLoaderService,
    ],
    exports: [
      UrlDbLoaderService,
      BookDbLoaderService,
      BookReviewDbLoaderService,
      BookSummaryDbLoaderService,
      MetadataDbLoaderService,
      MetadataDbLoaderQueueService,
      BrochureDbLoaderService,
    ],
  },
)
export class MetadataDbLoaderModule {}
