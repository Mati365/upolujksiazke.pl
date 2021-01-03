import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookPublisherEntity} from './BookPublisher.entity';
import {BookPublisherService} from './BookPublisher.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookPublisherEntity]),
    ],
    providers: [
      BookPublisherService,
    ],
    exports: [
      BookPublisherService,
    ],
  },
)
export class BookPublisherModule {}
