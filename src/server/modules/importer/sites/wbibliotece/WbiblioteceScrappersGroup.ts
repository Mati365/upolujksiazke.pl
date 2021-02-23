import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {WbiblioteceBookMatcher} from './WbiblioteceBook.matcher';
import {WbiblioteceBookParser} from './WbiblioteceBook.parser';

export class WbiblioteceScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new WbiblioteceBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new WbiblioteceBookParser,
        },
      },
    );
  }
}
