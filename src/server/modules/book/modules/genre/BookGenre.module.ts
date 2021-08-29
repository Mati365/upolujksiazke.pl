import {Module} from '@nestjs/common';
import {BookGenreService} from './BookGenre.service';

@Module(
  {
    providers: [
      BookGenreService,
    ],
    exports: [
      BookGenreService,
    ],
  },
)
export class BookGenreModule {}
