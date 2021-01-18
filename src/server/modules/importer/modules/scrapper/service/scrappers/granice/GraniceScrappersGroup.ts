import {ScrapperMetadataKind} from '@scrapper/entity';

import {GraniceBookMatcher} from './matchers/GraniceBook.matcher';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

export class GraniceScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new GraniceBookMatcher(options),
        },
      },
    );
  }
}
