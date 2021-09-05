import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {isCmdAppInstance} from '@server/common/helpers';
import {BookCategoryRankingService} from '../services/BookCategoryRanking.service';

@Injectable()
export class BookCategoryCron {
  constructor(
    private readonly categoryRanking: BookCategoryRankingService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async refreshRanking() {
    if (!isCmdAppInstance())
      await this.categoryRanking.refreshCategoryRanking();
  }
}
