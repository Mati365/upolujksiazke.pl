import {ScrapperMetadataKind} from '@scrapper/entity';
import {WebsiteInfoScrapper, WebsiteScrappersGroup} from '@scrapper/service/shared';
import {WykopBookReviewScrapper, WykopBookReviewScrapperConfig} from './book-review/WykopBookReview.scrapper';

export type WykopScrappersGroupConfig = WykopBookReviewScrapperConfig & {
  homepageURL: string,
};

export class WykopScrappersGroup extends WebsiteScrappersGroup {
  constructor({api, homepageURL}: WykopScrappersGroupConfig) {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper(homepageURL),
        scrappers: {
          [ScrapperMetadataKind.BOOK_REVIEW]: new WykopBookReviewScrapper(
            {
              api,
            },
          ),
        },
      },
    );
  }
}
