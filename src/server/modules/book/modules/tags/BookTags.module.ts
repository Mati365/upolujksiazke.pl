import {Module} from '@nestjs/common';
import {BookTagsService} from './BookTags.service';

@Module(
  {
    providers: [
      BookTagsService,
    ],

    exports: [
      BookTagsService,
    ],
  },
)
export class BookTagsModule {}
