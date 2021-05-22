import {Module} from '@nestjs/common';
import {BookAuthorService} from './BookAuthor.service';
import {EsBookAuthorIndex} from './indices/EsBookAuthor.index';

@Module(
  {
    providers: [
      EsBookAuthorIndex,
      BookAuthorService,
    ],
    exports: [
      EsBookAuthorIndex,
      BookAuthorService,
    ],
  },
)
export class BookAuthorModule {}
