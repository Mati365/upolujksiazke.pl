import {Module, forwardRef} from '@nestjs/common';
import {BookModule} from '../../Book.module';
import {BookReviewerModule} from '../reviewer/BookReviewer.module';
import {BookReviewService} from './BookReview.service';

@Module(
  {
    imports: [
      BookReviewerModule,
      forwardRef(() => BookModule),
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
