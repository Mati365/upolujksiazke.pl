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
import {BookEntity} from './Book.entity';
import {BookService} from './Book.service';
import {TagModule} from '../tag';

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
      TagModule,
      TypeOrmModule.forFeature([BookEntity]),
    ],
    providers: [
      BookService,
    ],
    exports: [
      BookAvailabilityModule,
      BookPublisherModule,
      BookService,
      BookReleaseModule,
      BookAuthorModule,
      BookReviewerModule,
      BookReviewModule,
      BookCategoryModule,
      BookVolumeModule,
      BookKindModule,
      BookPrizeModule,
      BookSeriesModule,
    ],
  },
)
export class BookModule {}
