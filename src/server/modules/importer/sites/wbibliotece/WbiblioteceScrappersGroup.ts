import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShop.scrapper';

import {WbiblioteceBookMatcher} from './WbiblioteceBook.matcher';

export class WbiblioteceScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new WbiblioteceBookMatcher(options),
        },
      },
    );
  }

  /**
   * @inheritdoc
   */
  matchResourceKindByPath(path: string): ScrapperMetadataKind {
    throw new Error(`Missing resource path macher for ${path}!`);
  }
}
