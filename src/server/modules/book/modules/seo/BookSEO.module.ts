import {Module, forwardRef} from '@nestjs/common';
import {BookModule} from '../../Book.module';

import {BookStatsModule} from '../stats';
import {BookSEOCron} from './cron/BookSEO.cron';
import {BookTagsTextHydratorService} from './service/BookTagsTextHydrator.service';

@Module(
  {
    imports: [
      BookStatsModule,
      forwardRef(() => BookModule),
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
