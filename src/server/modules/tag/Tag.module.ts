import {Module} from '@nestjs/common';
import {TagService} from './Tag.service';

@Module(
  {
    exports: [
      TagService,
    ],
    providers: [
      TagService,
    ],
  },
)
export class TagModule {}
