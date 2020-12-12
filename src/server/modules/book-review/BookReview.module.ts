import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {BookReviewEntity} from './BookReview.entity';

@Module(
  {
    imports: [
      MikroOrmModule.forFeature([BookReviewEntity]),
    ],
    providers: [],
    controllers: [],
  },
)
export class BookReviewModule {}
