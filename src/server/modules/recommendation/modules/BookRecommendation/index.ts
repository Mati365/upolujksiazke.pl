import {Module} from '@nestjs/common';
import {BookModule} from '@server/modules/book/Book.module';
import {BookRecommendationService} from './BookRecommendation.service';

@Module(
  {
    imports: [
      BookModule,
    ],
    providers: [
      BookRecommendationService,
    ],
    exports: [
      BookRecommendationService,
    ],
  },
)
export class BookRecommendationModule {}
