import {Module} from '@nestjs/common';
import {
  BookStatsService,
  BookTagsStatsService,
} from './services';

@Module(
  {
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
