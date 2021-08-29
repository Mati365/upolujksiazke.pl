import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {MadBooksBookMatcher} from './MadBooksBook.matcher';
import {MadBooksBookParser} from './MadBooksBook.parser';

export class MadBooksScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new MadBooksBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new MadBooksBookParser,
        },
      },
    );
  }
}
