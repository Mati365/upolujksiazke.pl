import {Module} from '@nestjs/common';

import {MetadataDbLoaderModule} from './modules/db-loader/MetadataDbLoader.module';
import {ScrapperModule} from './modules/scrapper/Scrapper.module';
import {SpiderModule} from './modules/spider/Spider.module';
import {ScrapperTaskRunnerModule} from './modules/task-runner/ScrapperTaskRunner.module';

@Module(
  {
    imports: [
      MetadataDbLoaderModule,
      ScrapperModule,
      SpiderModule,
      ScrapperTaskRunnerModule,
    ],
  },
)
export class ImporterModule {}
