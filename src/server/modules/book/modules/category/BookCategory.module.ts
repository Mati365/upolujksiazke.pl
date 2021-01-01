import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookCategoryEntity} from './BookCategory.entity';
import {BookCategoryService} from './BookCategory.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookCategoryEntity]),
    ],
    providers: [
      BookCategoryService,
    ],
    exports: [
      BookCategoryService,
    ],
  },
)
export class BookCategoryModule {}
