import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShop.scrapper';

import {DadadaBookMatcher} from './DadadaBook.matcher';
import {DadadaBookParser} from './DadadaBook.parser';

export class DadadaScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new DadadaBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new DadadaBookParser(options),
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
