import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@scrapper/service/scrappers/BookShopScrappersGroup';

import {BonitoBookMatcher} from './BonitoBook.matcher';
import {BonitoBookParser} from './BonitoBook.parser';

export class BonitoScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new BonitoBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new BonitoBookParser(options),
        },
      },
    );
  }
}
