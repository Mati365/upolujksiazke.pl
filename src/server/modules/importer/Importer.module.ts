import {Module} from '@nestjs/common';

import {MetadataDbLoaderModule} from './modules/db-loader/MetadataDbLoader.module';
import {ScrapperModule} from './modules/scrapper/Scrapper.module';

@Module(
  {
    imports: [
      MetadataDbLoaderModule,
      ScrapperModule,
    ],
  },
)
export class ImporterModule {}
