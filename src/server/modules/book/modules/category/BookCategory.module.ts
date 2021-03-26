import {Module} from '@nestjs/common';
import {BookStatsModule} from '../stats';
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
    ],
    exports: [
      BookCategoryService,
      BookCategoryRankingService,
    ],
  },
)
export class BookCategoryModule {}
