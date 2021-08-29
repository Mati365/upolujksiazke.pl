import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {TaniaksiazkaBookMatcher} from './TaniaksiazkaBook.matcher';
import {TaniaksiazkaBookParser} from './TaniaksiazkaBook.parser';

export class TaniaksiazkaScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new TaniaksiazkaBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new TaniaksiazkaBookParser,
        },
      },
    );
  }
}
