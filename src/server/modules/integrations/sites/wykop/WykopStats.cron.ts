import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {isCmdAppInstance} from '@server/common/helpers';
import {isDevMode, nthDaysAgoDuration} from '@shared/helpers';

import {WykopStatsService} from './WykopStats.service';

@Injectable()
export class WykopStatsCron {
  constructor(
    private readonly wykopStatsService: WykopStatsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async refreshRanking() {
    const {wykopStatsService} = this;
    if (isDevMode() || isCmdAppInstance())
      return;

    await wykopStatsService.refreshMetadataReviewsStats(
      {
        duration: nthDaysAgoDuration(3),
      },
    );
  }
}
