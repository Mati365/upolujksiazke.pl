import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookAuthorModule} from './modules/author/BookAuthor.module';
import {BookReviewerModule} from './modules/reviewer/BookReviewer.module';
import {BookCategoryModule} from './modules/category/BookCategory.module';
import {BookReviewModule} from './modules/review/BookReview.module';

import {TagModule} from '../tag';
import {RemoteModule} from '../remote';
import {BookEntity} from './Book.entity';
import {BookService} from './Book.service';

@Module(
  {
    imports: [
      RemoteModule,
      BookAuthorModule,
      BookReviewerModule,
      BookReviewModule,
      BookCategoryModule,
      TagModule,
      TypeOrmModule.forFeature([BookEntity]),
    ],
    providers: [
      BookService,
    ],
    exports: [
      BookService,
      BookAuthorModule,
      BookReviewerModule,
      BookReviewModule,
      BookCategoryModule,
    ],
  },
)
export class BookModule {}
