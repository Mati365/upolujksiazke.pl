import {Module} from '@nestjs/common';
import {BookAvailabilityService} from './BookAvailability.service';

@Module(
  {
    providers: [
      BookAvailabilityService,
    ],
    exports: [
      BookAvailabilityService,
    ],
  },
)
export class BookAvailabilityModule {}
