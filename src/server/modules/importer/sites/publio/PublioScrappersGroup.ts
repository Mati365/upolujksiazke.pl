import {matchByRegex} from '@shared/helpers/matchByRegex';

import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShop.scrapper';

import {PublioBookMatcher} from './matchers/PublioBook.matcher';
import {PublioBookPublisherMatcher} from './matchers/PublioBookPublisher.matcher';
import {PublioBookParser} from './parsers/PublioBook.parser';
import {PublioPublisherParser} from './parsers/PublioPublisher.parser';

export class PublioScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        parsers: {
          [ScrapperMetadataKind.BOOK]: new PublioBookParser(options),
          [ScrapperMetadataKind.BOOK_PUBLISHER]: new PublioPublisherParser(options),
        },
        matchers: {
          [ScrapperMetadataKind.BOOK]: new PublioBookMatcher(options),
          [ScrapperMetadataKind.BOOK_PUBLISHER]: new PublioBookPublisherMatcher(options),
        },
      },
    );
  }

  /**
   * @inheritdoc
   */
  matchResourceKindByPath(path: string): ScrapperMetadataKind {
    return matchByRegex(
      {
        ',p\\d+.html$': () => ScrapperMetadataKind.BOOK,
      },
      path,
    );
  }
}
