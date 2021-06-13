import {Module, forwardRef} from '@nestjs/common';

import {BookReviewerModule} from '../reviewer/BookReviewer.module';
import {BookSearchModule} from '../search/BookSearch.module';
import {BookStatsModule} from '../stats/BookStats.module';
import {BookReviewService} from './BookReview.service';

@Module(
  {
    imports: [
      forwardRef(() => BookReviewerModule),
      forwardRef(() => BookStatsModule),
      forwardRef(() => BookSearchModule),
    ],
    providers: [
      BookReviewService,
    ],
    exports: [
      BookReviewService,
    ],
  },
)
export class BookReviewModule {}
