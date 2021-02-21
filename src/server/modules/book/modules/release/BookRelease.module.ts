import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookAvailabilityModule} from '../availability/BookAvailability.module';
import {BookPublisherModule} from '../publisher/BookPublisher.module';
import {BookReviewModule} from '../review/BookReview.module';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookReleaseService} from './BookRelease.service';

@Module(
  {
    imports: [
      BookReviewModule,
      BookPublisherModule,
      BookAvailabilityModule,
      TypeOrmModule.forFeature([BookReleaseEntity]),
    ],
    providers: [
      BookReleaseService,
    ],
    exports: [
      BookReleaseService,
    ],
  },
)
export class BookReleaseModule {}
