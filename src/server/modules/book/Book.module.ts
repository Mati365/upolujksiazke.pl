import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {BookEntity} from './Book.entity';

@Module(
  {
    imports: [
      MikroOrmModule.forFeature([BookEntity]),
    ],
    providers: [],
    controllers: [],
  },
)
export class BookModule {}
