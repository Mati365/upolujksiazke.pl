import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookReviewEntity} from './BookReview.entity';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookReviewEntity]),
    ],
  },
)
export class BookReviewModule {}
