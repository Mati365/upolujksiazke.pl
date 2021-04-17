import {forwardRef, Module} from '@nestjs/common';
import {BookModule} from '../../Book.module';
import {
  BookStatsService,
  BookTagsStatsService,
} from './services';

@Module(
  {
    imports: [
      forwardRef(() => BookModule),
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
