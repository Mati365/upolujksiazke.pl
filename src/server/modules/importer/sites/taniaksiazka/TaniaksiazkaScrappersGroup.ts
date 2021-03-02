import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {TaniaksiazkaBookMatcher} from './TaniaksiazkaBook.matcher';
import {TaniaksiazkaBookParser} from './TaniaksiazkaBook.parser';

export class TaniaksiazkaScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
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
