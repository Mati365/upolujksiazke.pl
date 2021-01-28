import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookPrizeEntity} from './BookPrize.entity';
import {BookPrizeService} from './BookPrize.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookPrizeEntity]),
    ],
    providers: [
      BookPrizeService,
    ],
    exports: [
      BookPrizeService,
    ],
  },
)
export class BookPrizeModule {}
