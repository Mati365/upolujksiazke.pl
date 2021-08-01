import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {PolskiNa5BookSummaryMatcher} from './PolskiNa5BookSummary.matcher';
import {PolskiNa5BookSummaryParser} from './PolskiNa5BookSummary.parser';

export class PolskiNa5ScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
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
