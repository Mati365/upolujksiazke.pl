import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {EszkolaBookSummaryMatcher} from './EszkolaBookSummary.matcher';
import {EszkolaBookSummaryParser} from './EszkolaBookSummary.parser';

export class EszkolaScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new EszkolaBookSummaryMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new EszkolaBookSummaryParser,
        },
      },
    );
  }
}
