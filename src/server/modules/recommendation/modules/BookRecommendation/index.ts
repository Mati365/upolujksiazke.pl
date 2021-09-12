import {Module} from '@nestjs/common';
import {BookModule} from '@server/modules/book/Book.module';
import {BookSimilarityFilterService} from './BookSimilarityFilter.service';

@Module(
  {
    imports: [
      BookModule,
    ],
    providers: [
      BookSimilarityFilterService,
    ],
    exports: [
      BookSimilarityFilterService,
    ],
  },
)
export class BookRecommendationModule {}
