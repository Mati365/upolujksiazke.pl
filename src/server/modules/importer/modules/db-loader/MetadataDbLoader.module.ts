import {Module, forwardRef} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';
import {TypeOrmModule} from '@nestjs/typeorm';

import {TagModule} from '@server/modules/tag';
import {BookCategoryEntity} from '@server/modules/book/modules/category/BookCategory.entity';
import {BookReviewerEntity} from '@server/modules/book/modules/reviewer/BookReviewer.entity';
import {BookModule} from '@server/modules/book/Book.module';

import {ScrapperMetadataEntity} from '../scrapper/entity';
import {BookDbLoader, BookReviewDbLoader} from './loaders';

import {
  MetadataDbLoaderService,
  MetadataDbLoaderQueueService,
} from './services';

import {
  SCRAPPER_METADATA_LOADER_QUEUE,
  MetadataDbLoaderConsumerProcessor,
} from './processors/MetadataDbLoaderConsumer.processor';

@Module(
  {
    imports: [
      TagModule,
      forwardRef(() => BookModule),

      BullModule.registerQueue(
        {
          name: SCRAPPER_METADATA_LOADER_QUEUE,
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
      BookDbLoader,
      BookReviewDbLoader,
    ],
    exports: [
      MetadataDbLoaderQueueService,
    ],
  },
)
export class MetadataDbLoaderModule {}
