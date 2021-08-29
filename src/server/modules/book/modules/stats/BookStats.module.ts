import {Module, forwardRef} from '@nestjs/common';

import {TrackerModule} from '@server/modules/tracker';
import {BookCategoryModule} from '../category/BookCategory.module';
import {BookSearchModule} from '../search/BookSearch.module';
import {
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
    ],
    exports: [
      BookStatsService,
      BookTagsStatsService,
    ],
  },
)
export class BookStatsModule {}
