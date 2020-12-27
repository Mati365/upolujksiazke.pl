import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {ScrapperMetadataKind} from '../entity';
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
        kind: ScrapperMetadataKind.BOOK_REVIEW,
        maxIterations: 1,
      },
    );
  }
}
