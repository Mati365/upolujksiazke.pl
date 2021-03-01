import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {WoblinkBookMatcher} from './WoblinkBook.matcher';
import {WoblinkBookParser} from './WoblinkBook.parser';

export class WoblinkScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new WoblinkBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new WoblinkBookParser,
        },
      },
    );
  }
}
