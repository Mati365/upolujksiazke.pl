import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';

import {DB_CONFIG} from './config/dbConfig';

@Module(
  {
    imports: [
      MikroOrmModule.forRoot(DB_CONFIG),
    ],
    exports: [
      MikroOrmModule,
    ],
  },
)
export class DatabaseModule {}
