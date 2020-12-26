import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';
import {MikroOrmModule} from '@mikro-orm/nestjs';

import {BookReviewerEntity} from '@server/modules/book-reviewer/BookReviewer.entity';
import {ScrapperMetadataEntity} from '../scrapper/entity';
import {BookReviewDbLoader} from './loaders';

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
      BullModule.registerQueue(
        {
          name: SCRAPPER_METADATA_LOADER_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        },
      ),
      MikroOrmModule.forFeature(
        [
          BookReviewerEntity,
          ScrapperMetadataEntity,
        ],
      ),
    ],
    providers: [
      MetadataDbLoaderConsumerProcessor,
      MetadataDbLoaderService,
      MetadataDbLoaderQueueService,
      BookReviewDbLoader,
    ],
    exports: [
      MetadataDbLoaderQueueService,
    ],
  },
)
export class MetadataDbLoaderModule {}
