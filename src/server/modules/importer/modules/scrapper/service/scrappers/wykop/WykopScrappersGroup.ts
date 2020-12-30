import {ScrapperMetadataKind} from '../../../entity';
import {WebsiteInfoScrapper, WebsiteScrappersGroup} from '../../shared';
import {WykopBookReviewScrapper} from './book-review/WykopBookReview.scrapper';

export class WykopScrappersGroup extends WebsiteScrappersGroup {
  constructor() {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper('https://wykop.pl'),
        scrappers: {
          [ScrapperMetadataKind.BOOK_REVIEW]: new WykopBookReviewScrapper,
        },
      },
    );
  }
}
