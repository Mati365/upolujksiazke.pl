import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {LiteraturaGildiaBookMatcher} from './matchers/LiteraturaGildiaBook.matcher';
import {LiteraturaGildiaBookAuthorMatcher} from './matchers/LiteraturaGildiaBookAuthor.matcher';
import {LiteraturaGildiaBookPublisherMatcher} from './matchers/LiteraturaGildiaBookPublisher.matcher';
import {LiteraturaGildiaBookParser} from './parsers/LiteraturaGildiaBook.parser';
import {LiteraturaGildiaBookAuthorParser} from './parsers/LiteraturaGildiaBookAuthor.parser';
import {LiteraturaGildiaBookPublisherParser} from './parsers/LiteraturaGildiaBookPublisher.parser';

export class LiteraturaGildiaScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new LiteraturaGildiaBookMatcher(options),
          [ScrapperMetadataKind.BOOK_AUTHOR]: new LiteraturaGildiaBookAuthorMatcher(options),
          [ScrapperMetadataKind.BOOK_PUBLISHER]: new LiteraturaGildiaBookPublisherMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new LiteraturaGildiaBookParser,
          [ScrapperMetadataKind.BOOK_AUTHOR]: new LiteraturaGildiaBookAuthorParser,
          [ScrapperMetadataKind.BOOK_PUBLISHER]: new LiteraturaGildiaBookPublisherParser,
        },
      },
    );
  }
}
