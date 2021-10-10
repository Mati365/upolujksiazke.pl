import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {isDevMode} from '@shared/helpers';
import {isCmdAppInstance} from '@server/common/helpers';

import {ScrapperMetadataKind} from '../entity';
import {ScrapperRefreshService} from './actions';

@Injectable()
export class ScrapperCronService {
  static readonly REFRESHABLE_KINDS = [
    ScrapperMetadataKind.BOOK_REVIEW,
    ScrapperMetadataKind.BROCHURE,
  ];

  constructor(
    private readonly scrapperRefreshService: ScrapperRefreshService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchLatestReviews() {
    if (isDevMode() || isCmdAppInstance())
      return;

    for await (const kind of ScrapperCronService.REFRESHABLE_KINDS) {
      await this.scrapperRefreshService.refreshLatest(
        {
          maxIterations: 1,
          kind,
        },
      );
    }
  }
}
