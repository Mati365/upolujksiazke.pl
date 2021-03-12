import {Module} from '@nestjs/common';
import {BookReviewerModule} from '../reviewer/BookReviewer.module';
import {BookReviewService} from './BookReview.service';

@Module(
  {
    imports: [
      BookReviewerModule,
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
