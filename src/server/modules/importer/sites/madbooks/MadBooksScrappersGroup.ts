import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {MadBooksBookMatcher} from './MadBooksBook.matcher';
import {MadBooksBookParser} from './MadBooksBook.parser';

export class MadBooksScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
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
