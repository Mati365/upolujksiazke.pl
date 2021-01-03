import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';

import {MatrasBookMatcher} from './MatrasBook.matcher';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

export class MatrasScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new MatrasBookMatcher(options),
        },
      },
    );
  }
}
