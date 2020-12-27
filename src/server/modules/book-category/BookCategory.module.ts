import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookCategoryEntity} from './BookCategory.entity';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookCategoryEntity]),
    ],
  },
)
export class BookCategoryModule {}
