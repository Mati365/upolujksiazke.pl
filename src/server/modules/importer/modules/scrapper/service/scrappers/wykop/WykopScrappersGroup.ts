import {ScrapperMetadataKind} from '../../../entity';
import {WebsiteScrappersGroup} from '../../shared';

import {WykopBookReviewScrapper} from './book-review/WykopBookReview.scrapper';
import {WykopWebsiteInfoScrapper} from './WykopWebsiteInfo.scrapper';

export class WykopScrappersGroup extends WebsiteScrappersGroup<WykopWebsiteInfoScrapper> {
  constructor() {
    super(
      {
        websiteInfoScrapper: new WykopWebsiteInfoScrapper,
        scrappers: {
          [ScrapperMetadataKind.BOOK_REVIEW]: new WykopBookReviewScrapper,
        },
      },
    );
  }
}
