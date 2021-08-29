import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {BonitoBookMatcher} from './BonitoBook.matcher';
import {BonitoBookParser} from './BonitoBook.parser';

export class BonitoScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new BonitoBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new BonitoBookParser,
        },
      },
    );
  }
}
