import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookReleaseEntity} from './BookRelease.entity';
import {BookReleaseService} from './BookRelease.service';

@Module(
  {
    imports: [
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
