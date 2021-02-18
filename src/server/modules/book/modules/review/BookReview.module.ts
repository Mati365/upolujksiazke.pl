import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookReviewerModule} from '../reviewer';
import {BookReviewEntity} from './BookReview.entity';

@Module(
  {
    imports: [
      BookReviewerModule,
      TypeOrmModule.forFeature([BookReviewEntity]),
    ],
  },
)
export class BookReviewModule {}
