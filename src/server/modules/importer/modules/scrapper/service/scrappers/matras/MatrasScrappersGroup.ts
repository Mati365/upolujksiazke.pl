import {ScrapperMetadataKind} from '@scrapper/entity';

import {MatrasBookMatcher} from './matchers/MatrasBook.matcher';
import {MatrasBookAuthorMatcher} from './matchers/MatrasBookAuthor.matcher';
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
          [ScrapperMetadataKind.BOOK_AUTHOR]: new MatrasBookAuthorMatcher(options),
        },
      },
    );
  }
}
