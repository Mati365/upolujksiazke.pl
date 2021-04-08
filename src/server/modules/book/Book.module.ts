import {Module} from '@nestjs/common';

import {ElasticsearchConnectionModule} from '../elasticsearch';
import {TagModule} from '../tag';
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

import {EsBookIndex} from './services/indexes/EsBook.index';
import {
  CardBookSearchService,
  BookService,
  BookTagsService,
  FuzzyBookSearchService,
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
      TagModule,
    ],
    providers: [
      EsBookIndex,
      BookService,
      BookTagsService,
      FuzzyBookSearchService,
      CardBookSearchService,
    ],
    exports: [
      EsBookIndex,
      FuzzyBookSearchService,
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
      CardBookSearchService,
    ],
  },
)
export class BookModule {}
