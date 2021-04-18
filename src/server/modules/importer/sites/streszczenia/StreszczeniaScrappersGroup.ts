import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {StreszczeniaBookSummaryMatcher} from './StreszczeniaBookSummary.matcher';
import {StreszczeniaBookSummaryParser} from './StreszczeniaBookSummary.parser';

export class StreszczeniaScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new StreszczeniaBookSummaryMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new StreszczeniaBookSummaryParser,
        },
      },
    );
  }
}
