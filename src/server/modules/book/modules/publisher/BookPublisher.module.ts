import {Module} from '@nestjs/common';
import {BookPublisherService} from './BookPublisher.service';

@Module(
  {
    providers: [
      BookPublisherService,
    ],
    exports: [
      BookPublisherService,
    ],
  },
)
export class BookPublisherModule {}
