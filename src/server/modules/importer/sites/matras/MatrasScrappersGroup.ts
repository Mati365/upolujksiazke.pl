import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShopScrappersGroup';

import {MatrasBookMatcher} from './matchers/MatrasBook.matcher';
import {MatrasBookAuthorMatcher} from './matchers/MatrasBookAuthor.matcher';

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
