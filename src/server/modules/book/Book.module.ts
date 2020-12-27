import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookEntity} from './Book.entity';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookEntity]),
    ],
  },
)
export class BookModule {}
