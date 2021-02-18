import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {GraniceBookMatcher} from './GraniceBook.matcher';
import {GraniceBookParser} from './GraniceBook.parser';
import {GraniceSpider} from './GraniceBook.spider';

export class GraniceScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: new GraniceSpider,
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
