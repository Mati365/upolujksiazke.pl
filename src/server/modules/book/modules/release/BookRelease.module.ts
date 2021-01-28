import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookPublisherModule} from '../publisher';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookReleaseService} from './BookRelease.service';

@Module(
  {
    imports: [
      BookPublisherModule,
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
