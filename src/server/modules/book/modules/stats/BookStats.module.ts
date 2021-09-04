import {Module, forwardRef} from '@nestjs/common';

import {TrackerModule} from '@server/modules/tracker';
import {BookCategoryModule} from '../category/BookCategory.module';
import {BookSearchModule} from '../search/BookSearch.module';
import {
  BooksAnalyticsService,
  BookStatsService,
  BookTagsStatsService,
} from './services';

@Module(
  {
    imports: [
      TrackerModule,
      forwardRef(() => BookCategoryModule),
      forwardRef(() => BookSearchModule),
    ],
    providers: [
      BookStatsService,
      BookTagsStatsService,
      BooksAnalyticsService,
    ],
    exports: [
      BookStatsService,
      BookTagsStatsService,
      BooksAnalyticsService,
    ],
  },
)
export class BookStatsModule {}
