import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {ScrapperModule} from '@scrapper/Scrapper.module';
import {BookReviewerEntity} from './BookReviewer.entity';
import {BookReviewerService} from './BookReviewer.service';

@Module(
  {
    imports: [
      ScrapperModule,
      TypeOrmModule.forFeature([BookReviewerEntity]),
    ],
    providers: [
      BookReviewerService,
    ],
    exports: [
      BookReviewerService,
    ],
  },
)
export class BookReviewerModule {}
