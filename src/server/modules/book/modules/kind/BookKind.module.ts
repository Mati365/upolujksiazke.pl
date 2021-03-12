import {Module} from '@nestjs/common';
import {BookKindService} from './BookKind.service';

@Module(
  {
    providers: [
      BookKindService,
    ],
    exports: [
      BookKindService,
    ],
  },
)
export class BookKindModule {}
