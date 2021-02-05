import {Module} from '@nestjs/common';

import {MetadataDbLoaderModule} from './modules/db-loader/MetadataDbLoader.module';
import {ScrapperModule} from './modules/scrapper/Scrapper.module';
import {SpiderModule} from './modules/spider/Spider.module';

@Module(
  {
    imports: [
      MetadataDbLoaderModule,
      ScrapperModule,
      SpiderModule,
    ],
  },
)
export class ImporterModule {}
