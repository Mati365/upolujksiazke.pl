import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {BookTagsTextHydratorService} from '../service/BookTagsTextHydrator.service';

@Injectable()
export class BookSEOCron {
  constructor(
    private readonly tagsHydrator: BookTagsTextHydratorService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async refreshRanking() {
    await this.tagsHydrator.refreshAllBooksHydratedTags();
  }
}
