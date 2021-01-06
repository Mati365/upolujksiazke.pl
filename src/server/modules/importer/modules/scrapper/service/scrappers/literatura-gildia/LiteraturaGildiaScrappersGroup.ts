import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';

import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

import {LiteraturaGildiaBookMatcher} from './matchers/LiteraturaGildiaBook.matcher';
import {LiteraturaGildiaBookAuthorMatcher} from './matchers/LiteraturaGildiaBookAuthor.matcher';
import {LiteraturaGildiaBookPublisherMatcher} from './matchers/LiteraturaGildiaBookPublisher.matcher';

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
      },
    );
  }
}
