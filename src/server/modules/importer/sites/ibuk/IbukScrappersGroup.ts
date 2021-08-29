import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {IbukBookMatcher} from './IbukBook.matcher';
import {IbukBookParser} from './IbukBook.parser';

export class IbukScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new IbukBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new IbukBookParser,
        },
      },
    );
  }
}
