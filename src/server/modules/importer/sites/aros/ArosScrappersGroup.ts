import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShop.scrapper';

import {ArosBookMatcher} from './ArosBook.matcher';
import {ArosBookParser} from './ArosBook.parser';

export class ArosScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new ArosBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new ArosBookParser(options),
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
