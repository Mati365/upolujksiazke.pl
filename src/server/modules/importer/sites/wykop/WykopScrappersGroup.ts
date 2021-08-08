import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {
  WykopBookReviewScrapper,
  WykopBookReviewScrapperConfig,
} from './book-review/WykopBookReview.scrapper';

export type WykopScrappersGroupConfig = WykopBookReviewScrapperConfig & DefaultScrappersGroupConfig;

export class WykopScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor({api, ...config}: WykopScrappersGroupConfig) {
    super(
      {
        ...config,
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
