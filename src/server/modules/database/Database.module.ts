import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {DB_CONFIG} from './config/dbConfig';

@Module(
  {
    imports: [
      TypeOrmModule.forRoot(DB_CONFIG),
    ],
    exports: [
      TypeOrmModule,
    ],
  },
)
export class DatabaseModule {}
