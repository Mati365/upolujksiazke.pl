import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';
import {MikroOrmModule} from '@mikro-orm/nestjs';

import {ScrapperMetadataEntity} from '../scrapper/entity';

import {MetadataDbLoaderService} from './services/MetadataDbLoader.service';
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
          ScrapperMetadataEntity,
        ],
      ),
    ],
    providers: [
      MetadataDbLoaderConsumerProcessor,
      MetadataDbLoaderService,
    ],
    exports: [
      BullModule,
      MetadataDbLoaderService,
      MetadataDbLoaderConsumerProcessor,
    ],
  },
)
export class MetadataDbLoaderModule {}
