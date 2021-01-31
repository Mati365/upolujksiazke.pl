import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookAvailabilityModule} from '../availability';
import {BookPublisherModule} from '../publisher';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookReleaseService} from './BookRelease.service';

@Module(
  {
    imports: [
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
