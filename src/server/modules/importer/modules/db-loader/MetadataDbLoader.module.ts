import {Module, forwardRef} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';
import {TypeOrmModule} from '@nestjs/typeorm';

import {TagModule} from '@server/modules/tag';
import {BookCategoryEntity} from '@server/modules/book/modules/category/BookCategory.entity';
import {BookReviewerEntity} from '@server/modules/book/modules/reviewer/BookReviewer.entity';
import {BookModule} from '@server/modules/book/Book.module';

import {ScrapperMetadataEntity} from '../scrapper/entity';
import {
  BookDbLoader,
  BookReviewDbLoader,
  UrlDbLoader,
} from './loaders';

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
            max: 2,
            duration: 8000,
          },
        },
      ),
      TypeOrmModule.forFeature(
        [
          BookCategoryEntity,
          BookReviewerEntity,
          ScrapperMetadataEntity,
        ],
      ),
    ],
    providers: [
      MetadataDbLoaderConsumerProcessor,
      MetadataDbLoaderService,
      MetadataDbLoaderQueueService,
      UrlDbLoader,
      BookDbLoader,
      BookReviewDbLoader,
    ],
    exports: [
      MetadataDbLoaderQueueService,
    ],
  },
)
export class MetadataDbLoaderModule {}
