import {Module} from '@nestjs/common';

import {BookScrapperTaskRunner} from '@importer/kinds/tasks-runners';
import {ScrapperModule} from '@importer/modules/scrapper/Scrapper.module';
import {MetadataDbLoaderModule} from '@importer/modules/db-loader/MetadataDbLoader.module';
import {BookSearchModule} from '@server/modules/book/modules/search';
import {BookModule} from '@server/modules/book/Book.module';

@Module(
  {
    imports: [
      ScrapperModule,
      MetadataDbLoaderModule,
      BookModule,
      BookSearchModule,
    ],
    providers: [
      BookScrapperTaskRunner,
    ],
    exports: [
      BookScrapperTaskRunner,
    ],
  },
)
export class ScrapperTaskRunnerModule {}
