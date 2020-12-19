import {Injectable} from '@nestjs/common';

import {WykopScrapper} from './websites';
import {BookReviewAsyncScrapper} from './websites/BookReviewScrapper';

@Injectable()
export class ScrapperService {
  private scrappers: BookReviewAsyncScrapper[] = [
    new WykopScrapper,
  ];

  refreshLatest() {
    return this.scrappers[0].collect(1);
  }
}
