import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookAliasEntity} from './BookAlias.entity';
import {BookAliasService} from './BookAlias.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature(
        [
          BookAliasEntity,
        ],
      ),
    ],
    providers: [
      BookAliasService,
    ],
    exports: [
      BookAliasService,
    ],
  },
)
export class BookAliasModule {}
