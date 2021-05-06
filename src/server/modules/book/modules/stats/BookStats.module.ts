import {Module, forwardRef} from '@nestjs/common';

import {BookSearchModule} from '../search';
import {
  BookStatsService,
  BookTagsStatsService,
} from './services';

@Module(
  {
    imports: [
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
