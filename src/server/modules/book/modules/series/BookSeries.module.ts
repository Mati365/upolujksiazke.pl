import {Module} from '@nestjs/common';
import {
  BookHierarchySeriesService,
  BookSeriesService,
} from './services';

@Module(
  {
    providers: [
      BookSeriesService,
      BookHierarchySeriesService,
    ],
    exports: [
      BookSeriesService,
      BookHierarchySeriesService,
    ],
  },
)
export class BookSeriesModule {}
