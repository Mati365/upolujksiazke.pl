import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {ArosBookMatcher} from './ArosBook.matcher';
import {ArosBookParser} from './ArosBook.parser';

export class ArosScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new ArosBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new ArosBookParser,
        },
      },
    );
  }
}
