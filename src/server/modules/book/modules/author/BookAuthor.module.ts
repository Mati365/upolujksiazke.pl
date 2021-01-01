import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookAuthorEntity} from './BookAuthor.entity';
import {BookAuthorService} from './BookAuthor.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([BookAuthorEntity]),
    ],
    providers: [
      BookAuthorService,
    ],
    exports: [
      BookAuthorService,
    ],
  },
)
export class BookAuthorModule {}
