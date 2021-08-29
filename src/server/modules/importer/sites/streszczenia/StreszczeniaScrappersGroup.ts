import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {StreszczeniaBookSummaryMatcher} from './StreszczeniaBookSummary.matcher';
import {StreszczeniaBookSummaryParser} from './StreszczeniaBookSummary.parser';

export class StreszczeniaScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
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
