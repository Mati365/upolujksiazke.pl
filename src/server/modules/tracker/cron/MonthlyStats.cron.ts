import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {TrackRecordViewsService} from '../service/TrackRecordViews.service';

@Injectable()
export class MonthlyStatsCron {
  constructor(
    private readonly viewsTrack: TrackRecordViewsService,
  ) {}

  /**
   * Generate monthly stats
   *
   * @memberof MonthlyStatsCron
   */
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async refreshCurrentMonthStats() {
    await this.viewsTrack.refreshCurrentMonthStats();
  }
}
