import {Module} from '@nestjs/common';
import {BookSeriesService} from './BookSeries.service';

@Module(
  {
    providers: [
      BookSeriesService,
    ],
    exports: [
      BookSeriesService,
    ],
  },
)
export class BookSeriesModule {}
