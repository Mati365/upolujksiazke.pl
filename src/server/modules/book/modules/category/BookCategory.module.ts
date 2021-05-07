import {Module} from '@nestjs/common';

import {BookSearchModule} from '../search';
import {BookStatsModule} from '../stats';

import {BookCategoryCron} from './cron/BookCategory.cron';
import {
  BookCategoryService,
  BookCategoryRankingService,
} from './services';

@Module(
  {
    imports: [
      BookStatsModule,
      BookSearchModule,
    ],
    providers: [
      BookCategoryService,
      BookCategoryRankingService,
      BookCategoryCron,
    ],
    exports: [
      BookCategoryService,
      BookCategoryRankingService,
    ],
  },
)
export class BookCategoryModule {}
