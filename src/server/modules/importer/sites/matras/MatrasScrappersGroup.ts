import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {MatrasBookMatcher} from './matchers/MatrasBook.matcher';
import {MatrasBookAuthorMatcher} from './matchers/MatrasBookAuthor.matcher';
import {MatrasBookParser} from './parsers/MatrasBook.parser';
import {MatrasBookAuthorParser} from './parsers/MatrasBookAuthor.parser';

export class MatrasScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new MatrasBookMatcher(options),
          [ScrapperMetadataKind.BOOK_AUTHOR]: new MatrasBookAuthorMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new MatrasBookParser,
          [ScrapperMetadataKind.BOOK_AUTHOR]: new MatrasBookAuthorParser,
        },
      },
    );
  }
}
