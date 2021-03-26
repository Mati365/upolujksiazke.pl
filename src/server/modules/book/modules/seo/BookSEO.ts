import {Module} from '@nestjs/common';

import {BookStatsModule} from '../stats';
import {BookTagsTextHydratorService} from './service/BookTagsTextHydrator.service';

@Module(
  {
    imports: [
      BookStatsModule,
    ],
    providers: [
      BookTagsTextHydratorService,
    ],
    exports: [
      BookTagsTextHydratorService,
    ],
  },
)
export class BookSEOModule {}
