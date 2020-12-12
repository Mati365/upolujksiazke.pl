import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {AuthorEntity} from './Author.entity';

@Module(
  {
    imports: [
      MikroOrmModule.forFeature([AuthorEntity]),
    ],
    providers: [],
    controllers: [],
  },
)
export class AuthorModule {}
