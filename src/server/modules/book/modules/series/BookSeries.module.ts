import {Module, forwardRef} from '@nestjs/common';
import {BookSearchModule} from '../search/BookSearch.module';
import {
  BookHierarchySeriesService,
  BookSeriesService,
} from './services';

@Module(
  {
    imports: [
      forwardRef(() => BookSearchModule),
    ],
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
