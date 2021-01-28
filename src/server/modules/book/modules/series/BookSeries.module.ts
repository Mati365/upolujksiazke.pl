import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookEntity} from '../../Book.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';
import {BookSeriesEntity} from './BookSeries.entity';
import {BookSeriesService} from './BookSeries.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature(
        [
          BookEntity,
          BookReleaseEntity,
          BookSeriesEntity,
        ],
      ),
    ],
    providers: [
      BookSeriesService,
    ],
    exports: [
      BookSeriesService,
    ],
  },
)
export class BookSeriesModule {}
