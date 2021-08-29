import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {KlpBookSummaryMatcher} from './KlpBookSummary.matcher';
import {KlpBookSummaryParser} from './KlpBookSummary.parser';

export class KlpScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new KlpBookSummaryMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new KlpBookSummaryParser,
        },
      },
    );
  }
}
