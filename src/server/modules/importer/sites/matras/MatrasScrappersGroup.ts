import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShop.scrapper';

import {MatrasBookMatcher} from './matchers/MatrasBook.matcher';
import {MatrasBookAuthorMatcher} from './matchers/MatrasBookAuthor.matcher';
import {MatrasBookParser} from './parsers/MatrasBook.parser';
import {MatrasBookAuthorParser} from './parsers/MatrasBookAuthor.parser';

export class MatrasScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new MatrasBookMatcher(options),
          [ScrapperMetadataKind.BOOK_AUTHOR]: new MatrasBookAuthorMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new MatrasBookParser(options),
          [ScrapperMetadataKind.BOOK_AUTHOR]: new MatrasBookAuthorParser(options),
        },
      },
    );
  }
}
