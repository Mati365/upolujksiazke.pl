import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {EszkolaBookSummaryMatcher} from './EszkolaBookSummary.matcher';
import {EszkolaBookSummaryParser} from './EszkolaBookSummary.parser';

export class EszkolaScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
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
