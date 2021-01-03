import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';

import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

import {LiteraturaGildiaBookMatcher} from './matchers/LiteraturaGildiaBook.matcher';

export class LiteraturaGildiaScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new LiteraturaGildiaBookMatcher(options),
        },
      },
    );
  }
}
