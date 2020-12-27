import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthorEntity} from './Author.entity';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([AuthorEntity]),
    ],
  },
)
export class AuthorModule {}
