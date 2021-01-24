import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookAuthorModule} from './modules/author/BookAuthor.module';
import {BookReviewerModule} from './modules/reviewer/BookReviewer.module';
import {BookCategoryModule} from './modules/category/BookCategory.module';
import {BookReviewModule} from './modules/review/BookReview.module';
import {TagModule} from '../tag';
import {BookReleaseModule} from './modules/release';
import {BookPublisherModule} from './modules/publisher';
import {BookAvailabilityModule} from './modules/availability';
import {BookVolumeModule} from './modules/volume';
import {BookEntity} from './Book.entity';
import {BookService} from './Book.service';

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
    ],
  },
)
export class BookModule {}
