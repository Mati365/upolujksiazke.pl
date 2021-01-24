import {ScrapperMetadataKind} from '@scrapper/entity';

import {GildiaBookMatcher} from './GildiaBook.matcher';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

export class GildiaScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new GildiaBookMatcher(options),
        },
      },
    );
  }
}
