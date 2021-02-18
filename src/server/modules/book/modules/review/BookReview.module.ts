import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookReviewerModule} from '../reviewer/BookReviewer.module';
import {BookReviewEntity} from './BookReview.entity';
import {BookReviewService} from './BookReview.service';

@Module(
  {
    imports: [
      BookReviewerModule,
      TypeOrmModule.forFeature([BookReviewEntity]),
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
