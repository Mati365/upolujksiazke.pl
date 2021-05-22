import {forwardRef, Module} from '@nestjs/common';
import {BookModule} from '../../Book.module';
import {BookAuthorService} from './BookAuthor.service';
import {EsBookAuthorIndex} from './indices/EsBookAuthor.index';

@Module(
  {
    imports: [
      forwardRef(() => BookModule),
    ],
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
