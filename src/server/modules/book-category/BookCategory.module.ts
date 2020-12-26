import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {BookCategoryEntity} from './BookCategory.entity';

@Module(
  {
    imports: [
      MikroOrmModule.forFeature([BookCategoryEntity]),
    ],
  },
)
export class BookCategoryModule {}
