import {Module} from '@nestjs/common';
import {BookPrizeService} from './BookPrize.service';

@Module(
  {
    providers: [
      BookPrizeService,
    ],
    exports: [
      BookPrizeService,
    ],
  },
)
export class BookPrizeModule {}
