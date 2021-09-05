import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {isCmdAppInstance} from '@server/common/helpers';
import {BookTagsTextHydratorService} from '../service/BookTagsTextHydrator.service';

@Injectable()
export class BookSEOCron {
  constructor(
    private readonly tagsHydrator: BookTagsTextHydratorService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async refreshRanking() {
    if (!isCmdAppInstance())
      await this.tagsHydrator.refreshAllBooksHydratedTags();
  }
}
