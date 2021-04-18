import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {PolskiNa5BookSummaryMatcher} from './PolskiNa5BookSummary.matcher';
import {PolskiNa5BookSummaryParser} from './PolskiNa5BookSummary.parser';

export class PolskiNa5ScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new PolskiNa5BookSummaryMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new PolskiNa5BookSummaryParser,
        },
      },
    );
  }
}
