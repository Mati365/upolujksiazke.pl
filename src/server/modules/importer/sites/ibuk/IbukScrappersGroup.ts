import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {IbukBookMatcher} from './IbukBook.matcher';
import {IbukBookParser} from './IbukBook.parser';

export class IbukScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
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
