import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';

import {SkupszopBookMatcher} from './SkupszopBook.matcher';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

export class SkupszopScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new SkupszopBookMatcher(options),
        },
      },
    );
  }
}
