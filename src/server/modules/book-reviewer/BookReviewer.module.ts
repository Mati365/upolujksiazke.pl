import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookReviewerEntity} from './BookReviewer.entity';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookReviewerEntity]),
    ],
  },
)
export class BookReviewerModule {}
