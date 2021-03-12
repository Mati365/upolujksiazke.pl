import {Module} from '@nestjs/common';
import {BookAuthorService} from './BookAuthor.service';

@Module(
  {
    providers: [
      BookAuthorService,
    ],
    exports: [
      BookAuthorService,
    ],
  },
)
export class BookAuthorModule {}
