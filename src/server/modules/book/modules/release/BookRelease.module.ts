import {Module} from '@nestjs/common';

import {BookAvailabilityModule} from '../availability/BookAvailability.module';
import {BookPublisherModule} from '../publisher/BookPublisher.module';
import {BookReviewModule} from '../review/BookReview.module';
import {BookReleaseService} from './BookRelease.service';

@Module(
  {
    imports: [
      BookReviewModule,
      BookPublisherModule,
      BookAvailabilityModule,
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
