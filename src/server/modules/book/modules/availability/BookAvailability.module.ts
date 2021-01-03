import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookAvailabilityEntity} from './BookAvailability.entity';
import {BookAvailabilityService} from './BookAvailability.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookAvailabilityEntity]),
    ],
    providers: [
      BookAvailabilityService,
    ],
    exports: [
      BookAvailabilityService,
    ],
  },
)
export class BookAvailabilityModule {}
