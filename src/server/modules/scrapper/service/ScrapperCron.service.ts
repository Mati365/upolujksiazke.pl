import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {ScrapperService} from './Scrapper.service';

@Injectable()
export class ScrapperCronService {
  constructor(
    private readonly scrapperService: ScrapperService,
  ) {}

  @Cron('* * * * *')
  fetchLatestReviews() {
    this.scrapperService.refreshLatest(
      {
        maxIterations: 1,
      },
    );
  }
}
