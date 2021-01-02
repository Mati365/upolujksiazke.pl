import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {ScrapperMetadataKind} from '../entity';
import {ScrapperRefreshService} from './actions';

@Injectable()
export class ScrapperCronService {
  constructor(
    private readonly scrapperRefreshService: ScrapperRefreshService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  fetchLatestReviews() {
    this.scrapperRefreshService.refreshLatest(
      {
        kind: ScrapperMetadataKind.BOOK_REVIEW,
        maxIterations: 1,
      },
    );
  }
}
