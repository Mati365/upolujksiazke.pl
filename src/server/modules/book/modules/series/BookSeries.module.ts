import {Module, forwardRef} from '@nestjs/common';
import {BookModule} from '../../Book.module';
import {
  BookHierarchySeriesService,
  BookSeriesService,
} from './services';

@Module(
  {
    imports: [
      forwardRef(() => BookModule),
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
