import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShop.scrapper';

import {GraniceBookMatcher} from './GraniceBook.matcher';
import {GraniceBookParser} from './GraniceBook.parser';

export class GraniceScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new GraniceBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new GraniceBookParser(options),
        },
      },
    );
  }
}
