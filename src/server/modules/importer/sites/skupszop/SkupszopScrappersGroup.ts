import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShop.scrapper';

import {SkupszopBookMatcher} from './SkupszopBook.matcher';
import {SkupszopBookParser} from './SkupszopBook.parser';

export class SkupszopScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new SkupszopBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new SkupszopBookParser(options),
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
