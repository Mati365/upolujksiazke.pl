import {Module} from '@nestjs/common';

import {BookSearchModule} from '../search';
import {BookStatsModule} from '../stats';

import {BookCategoryCron} from './cron/BookCategory.cron';
import {EsBookCategoryIndex} from './indices/EsBookCategory.index';
import {
  BookCategoryService,
  BookCategoryRankingService,
  BookParentCategoryService,
} from './services';

@Module(
  {
    imports: [
      BookStatsModule,
      BookSearchModule,
    ],
    providers: [
      EsBookCategoryIndex,
      BookCategoryService,
      BookCategoryRankingService,
      BookParentCategoryService,
      BookCategoryCron,
    ],
    exports: [
      EsBookCategoryIndex,
      BookCategoryService,
      BookCategoryRankingService,
      BookParentCategoryService,
    ],
  },
)
export class BookCategoryModule {}
