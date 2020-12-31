import {ScrapperMetadataKind} from '../../../entity';
import {WebsiteInfoScrapper, WebsiteScrappersGroup} from '../../shared';
import {WykopBookReviewScrapper, WykopBookReviewScrapperConfig} from './book-review/WykopBookReview.scrapper';

export type WykopScrappersGroupConfig = WykopBookReviewScrapperConfig & {
  homepageURL: string,
};

export class WykopScrappersGroup extends WebsiteScrappersGroup {
  constructor({authConfig, homepageURL}: WykopScrappersGroupConfig) {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper(homepageURL),
        scrappers: {
          [ScrapperMetadataKind.BOOK_REVIEW]: new WykopBookReviewScrapper(
            {
              authConfig,
            },
          ),
        },
      },
    );
  }
}
