import {Module} from '@nestjs/common';
import {BookMatcherService} from './BookMatcher.service';

@Module(
  {
    providers: [
      BookMatcherService,
    ],
    exports: [
      BookMatcherService,
    ],
  },
)
export class BookMatcherModule {}
