import {Module} from '@nestjs/common';

import {BookMatcherModule} from './modules/book-matcher/BookMatcher.module';
import {MetadataDbLoaderModule} from './modules/metadata-db-loader/MetadataDbLoader.module';
import {ScrapperModule} from './modules/scrapper/Scrapper.module';

@Module(
  {
    imports: [
      MetadataDbLoaderModule,
      BookMatcherModule,
      ScrapperModule,
    ],
  },
)
export class ImporterModule {}
