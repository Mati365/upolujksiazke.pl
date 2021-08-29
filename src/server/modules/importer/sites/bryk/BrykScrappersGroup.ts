import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {BrykBookSummaryMatcher} from './BrykBookSummary.matcher';
import {BrykBookSummaryParser} from './BrykBookSummary.parser';

export class BrykScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new BrykBookSummaryMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new BrykBookSummaryParser,
        },
      },
    );
  }
}
