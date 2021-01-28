import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookKindEntity} from './BookKind.entity';
import {BookKindService} from './BookKind.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookKindEntity]),
    ],
    providers: [
      BookKindService,
    ],
    exports: [
      BookKindService,
    ],
  },
)
export class BookKindModule {}
