import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {GildiaBookMatcher} from './GildiaBook.matcher';
import {GildiaBookParser} from './GildiaBook.parser';

export class GildiaScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new GildiaBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new GildiaBookParser,
        },
      },
    );
  }
}
