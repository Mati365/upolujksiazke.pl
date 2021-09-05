import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {isCmdAppInstance} from '@server/common/helpers';
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
    if (!isCmdAppInstance())
      await this.viewsTrack.refreshCurrentMonthStats();
  }
}
