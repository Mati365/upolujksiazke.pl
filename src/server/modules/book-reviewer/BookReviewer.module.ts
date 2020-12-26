import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {BookReviewerEntity} from './BookReviewer.entity';

@Module(
  {
    imports: [
      MikroOrmModule.forFeature([BookReviewerEntity]),
    ],
  },
)
export class BookReviewerModule {}
