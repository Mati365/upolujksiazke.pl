import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';

import {LiteraturaGildiaBookMatcher} from './LiteraturaGildiaBook.matcher';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

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