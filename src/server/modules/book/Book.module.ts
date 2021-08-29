import {Module} from '@nestjs/common';

import {ElasticsearchConnectionModule} from '../elasticsearch';
import {TagModule} from '../tag/Tag.module';
import {BookAuthorModule} from './modules/author/BookAuthor.module';
import {BookReviewerModule} from './modules/reviewer/BookReviewer.module';
import {BookCategoryModule} from './modules/category/BookCategory.module';
import {BookReviewModule} from './modules/review/BookReview.module';
import {BookKindModule} from './modules/kind/BookKind.module';
import {BookReleaseModule} from './modules/release/BookRelease.module';
import {BookPublisherModule} from './modules/publisher/BookPublisher.module';
import {BookAvailabilityModule} from './modules/availability/BookAvailability.module';
import {BookVolumeModule} from './modules/volume/BookVolume.module';
import {BookPrizeModule} from './modules/prize/BookPrize.module';
import {BookSeriesModule} from './modules/series/BookSeries.module';
import {BookStatsModule} from './modules/stats/BookStats.module';
import {BookSEOModule} from './modules/seo/BookSEO.module';
import {BookEraModule} from './modules/era/BookEra.module';
import {BookGenreModule} from './modules/genre/BookGenre.module';
import {BookSummaryModule} from './modules/summary/BookSummary.module';
import {BookSearchModule} from './modules/search/BookSearch.module';
import {BookTagsModule} from './modules/tags/BookTags.module';
import {BookService} from './services';

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
      BookSearchModule,
      BookTagsModule,
      TagModule,
    ],
    providers: [
      BookService,
    ],
    exports: [
      BookService,
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
      BookSearchModule,
      BookGenreModule,
      BookEraModule,
      BookTagsModule,
    ],
  },
)
export class BookModule {}
