import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {ScrapperService} from './Scrapper.service';

@Injectable()
export class ScrapperCronService {
  constructor(
    private readonly scrapperService: ScrapperService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  fetchLatestReviews() {
    this.scrapperService.refreshLatest(
      {
        maxIterations: 1,
      },
    );
  }
}
