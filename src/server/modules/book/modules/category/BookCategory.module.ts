import {Module} from '@nestjs/common';
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
