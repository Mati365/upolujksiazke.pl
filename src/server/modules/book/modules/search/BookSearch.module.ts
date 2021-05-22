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
import {EsBookIndex} from './indices/EsBook.index';

import {
  CardBookSearchService,
  EsCardBookSearchService,
  EsFuzzyBookSearchService,
} from './service';

@Module(
  {
    imports: [
      forwardRef(() => BookCategoryModule),
      forwardRef(() => BookAuthorModule),
      BookTagsModule,
      BookReleaseModule,
      BookPrizeModule,
      BookReviewModule,
      BookSeriesModule,
      BookGenreModule,
      BookEraModule,
      BookSummaryModule,
    ],
    providers: [
      EsBookIndex,
      CardBookSearchService,
      EsCardBookSearchService,
      EsFuzzyBookSearchService,
    ],
    exports: [
      EsBookIndex,
      CardBookSearchService,
      EsCardBookSearchService,
      EsFuzzyBookSearchService,
    ],
  },
)
export class BookSearchModule {}
