import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {isDevMode} from '@shared/helpers';
import {ScrapperMetadataKind} from '../entity';
import {ScrapperRefreshService} from './actions';

@Injectable()
export class ScrapperCronService {
  constructor(
    private readonly scrapperRefreshService: ScrapperRefreshService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchLatestReviews() {
    if (isDevMode())
      return;

    await this.scrapperRefreshService.refreshLatest(
      {
        kind: ScrapperMetadataKind.BOOK_REVIEW,
        maxIterations: 1,
      },
    );
  }
}
