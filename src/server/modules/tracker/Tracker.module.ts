import {Global, Module} from '@nestjs/common';

import {MonthlyStatsCron} from './cron/MonthlyStats.cron';
import {TrackRecordViewsService} from './service/TrackRecordViews.service';

@Global()
@Module(
  {
    providers: [
      TrackRecordViewsService,
      MonthlyStatsCron,
    ],
    exports: [
      TrackRecordViewsService,
    ],
  },
)
export class TrackerModule {}
