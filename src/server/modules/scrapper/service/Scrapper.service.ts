import {Injectable} from '@nestjs/common';

import {BookReviewDto} from '@server/modules/book-review/BookReview.dto';
import {Scrapper} from './shared/Scrapper';
import {WykopScrapper} from './websites';

@Injectable()
export class ScrapperService {
  private scrappers: Scrapper<BookReviewDto[]>[] = [
    new WykopScrapper,
  ];

  latest() {
    return this.scrappers[0].collect(1);
  }
}
