import {Module} from '@nestjs/common';
import {BookEraService} from './BookEra.service';

@Module(
  {
    providers: [
      BookEraService,
    ],
    exports: [
      BookEraService,
    ],
  },
)
export class BookEraModule {}
