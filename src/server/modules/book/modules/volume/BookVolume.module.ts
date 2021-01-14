import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookEntity} from '../../Book.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';
import {BookVolumeEntity} from './BookVolume.entity';
import {BookVolumeService} from './BookVolume.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature(
        [
          BookEntity,
          BookReleaseEntity,
          BookVolumeEntity,
        ],
      ),
    ],
    providers: [
      BookVolumeService,
    ],
    exports: [
      BookVolumeService,
    ],
  },
)
export class BookVolumeModule {}
