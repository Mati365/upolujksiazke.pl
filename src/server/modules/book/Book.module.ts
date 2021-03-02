import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

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
import {BookAliasModule} from './modules/alias';
import {BookEntity} from './Book.entity';
import {BookService} from './Book.service';
import {TagModule} from '../tag';
import {FuzzyBookSearchService} from './FuzzyBookSearch.service';

@Module(
  {
    imports: [
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
      BookAliasModule,
      TagModule,
      TypeOrmModule.forFeature([BookEntity]),
    ],
    providers: [
      BookService,
      FuzzyBookSearchService,
    ],
    exports: [
      BookService,
      FuzzyBookSearchService,
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
      BookAliasModule,
    ],
  },
)
export class BookModule {}
