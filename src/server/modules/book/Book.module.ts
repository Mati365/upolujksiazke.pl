import {Module} from '@nestjs/common';

import {ElasticsearchConnectionModule} from '../elasticsearch';
import {TagModule} from '../tag/Tag.module';
import {BookAuthorModule} from './modules/author/BookAuthor.module';
import {BookReviewerModule} from './modules/reviewer/BookReviewer.module';
import {BookCategoryModule} from './modules/category/BookCategory.module';
import {BookReviewModule} from './modules/review/BookReview.module';
import {BookKindModule} from './modules/kind';
import {BookReleaseModule} from './modules/release';
import {BookPublisherModule} from './modules/publisher';
import {BookAvailabilityModule} from './modules/availability';
import {BookVolumeModule} from './modules/volume';
import {BookPrizeModule} from './modules/prize';
import {BookSeriesModule} from './modules/series';
import {BookStatsModule} from './modules/stats';
import {BookSEOModule} from './modules/seo';
import {BookEraModule} from './modules/era';
import {BookGenreModule} from './modules/genre';
import {BookSummaryModule} from './modules/summary';

import {EsBookIndex} from './services/indexes/EsBook.index';
import {
  CardBookSearchService,
  EsCardBookSearchService,
  BookService,
  BookTagsService,
  EsFuzzyBookSearchService,
} from './services';

@Module(
  {
    imports: [
      ElasticsearchConnectionModule,
      BookAvailabilityModule,
      BookPublisherModule,
      BookReleaseModule,
      BookAuthorModule,
      BookReviewerModule,
      BookReviewModule,
      BookCategoryModule,
      BookVolumeModule,
      BookKindModule,
      BookPrizeModule,
      BookSeriesModule,
      BookStatsModule,
      BookSEOModule,
      BookEraModule,
      BookGenreModule,
      BookSummaryModule,
      TagModule,
    ],
    providers: [
      EsBookIndex,
      BookService,
      BookTagsService,
      EsFuzzyBookSearchService,
      CardBookSearchService,
      EsCardBookSearchService,
    ],
    exports: [
      EsBookIndex,
      EsFuzzyBookSearchService,
      BookService,
      BookTagsService,
      BookAvailabilityModule,
      BookStatsModule,
      BookPublisherModule,
      BookReleaseModule,
      BookAuthorModule,
      BookReviewerModule,
      BookReviewModule,
      BookCategoryModule,
      BookVolumeModule,
      BookKindModule,
      BookPrizeModule,
      BookSeriesModule,
      BookSEOModule,
      BookSummaryModule,
      CardBookSearchService,
      EsCardBookSearchService,
    ],
  },
)
export class BookModule {}
