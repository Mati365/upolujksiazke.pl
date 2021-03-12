import {Module, forwardRef} from '@nestjs/common';
import {BookModule} from '../../Book.module';
import {
  BookCategoryService,
  BookCategoryRankingService,
} from './services';

@Module(
  {
    imports: [
      forwardRef(() => BookModule),
    ],
    providers: [
      BookCategoryService,
      BookCategoryRankingService,
    ],
    exports: [
      BookCategoryService,
      BookCategoryRankingService,
    ],
  },
)
export class BookCategoryModule {}
