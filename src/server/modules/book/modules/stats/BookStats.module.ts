import {Module, forwardRef} from '@nestjs/common';

import {TrackerModule} from '@server/modules/tracker';
import {BookSearchModule} from '../search';
import {
  BookStatsService,
  BookTagsStatsService,
} from './services';

@Module(
  {
    imports: [
      TrackerModule,
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
