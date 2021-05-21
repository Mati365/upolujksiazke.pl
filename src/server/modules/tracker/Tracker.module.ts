import {Global, Module} from '@nestjs/common';
import {TrackRecordViewsService} from './service/TrackRecordViews.service';

@Global()
@Module(
  {
    providers: [
      TrackRecordViewsService,
    ],
    exports: [
      TrackRecordViewsService,
    ],
  },
)
export class TrackerModule {}
