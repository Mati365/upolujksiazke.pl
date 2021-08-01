import {Module} from '@nestjs/common';

import {RemoteModule} from '@server/modules/remote/Remote.module';
import {BookAvailabilityModule} from '../availability/BookAvailability.module';
import {BookPublisherModule} from '../publisher/BookPublisher.module';
import {BookReviewModule} from '../review/BookReview.module';
import {BookReleaseService} from './BookRelease.service';

@Module(
  {
    imports: [
      RemoteModule,
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
