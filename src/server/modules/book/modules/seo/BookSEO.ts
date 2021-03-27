import {Module} from '@nestjs/common';

import {BookStatsModule} from '../stats';
import {BookSEOCron} from './cron/BookSEO.cron';
import {BookTagsTextHydratorService} from './service/BookTagsTextHydrator.service';

@Module(
  {
    imports: [
      BookStatsModule,
    ],
    providers: [
      BookTagsTextHydratorService,
      BookSEOCron,
    ],
    exports: [
      BookTagsTextHydratorService,
    ],
  },
)
export class BookSEOModule {}
