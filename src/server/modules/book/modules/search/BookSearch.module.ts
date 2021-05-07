import {Module, forwardRef} from '@nestjs/common';

import {BookCategoryModule} from '../category/BookCategory.module';
import {BookEraModule} from '../era/BookEra.module';
import {BookGenreModule} from '../genre/BookGenre.module';
import {BookPrizeModule} from '../prize/BookPrize.module';
import {BookReleaseModule} from '../release/BookRelease.module';
import {BookReviewModule} from '../review/BookReview.module';
import {BookSeriesModule} from '../series/BookSeries.module';
import {BookSummaryModule} from '../summary/BookSummary.module';
import {BookTagsModule} from '../tags/BookTags.module';
import {BookAuthorModule} from '../author/BookAuthor.module';
import {
  EsBookIndex,
  EsBookCategoryIndex,
} from './indices';

import {
  CardBookSearchService,
  EsCardBookSearchService,
  EsFuzzyBookSearchService,
} from './service';

@Module(
  {
    imports: [
      forwardRef(() => BookCategoryModule),
      BookTagsModule,
      BookReleaseModule,
      BookPrizeModule,
      BookReviewModule,
      BookSeriesModule,
      BookGenreModule,
      BookEraModule,
      BookSummaryModule,
      BookAuthorModule,
    ],
    providers: [
      EsBookIndex,
      EsBookCategoryIndex,
      CardBookSearchService,
      EsCardBookSearchService,
      EsFuzzyBookSearchService,
    ],
    exports: [
      EsBookIndex,
      EsBookCategoryIndex,
      CardBookSearchService,
      EsCardBookSearchService,
      EsFuzzyBookSearchService,
    ],
  },
)
export class BookSearchModule {}
