import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {ArosBookMatcher} from './ArosBook.matcher';
import {ArosBookParser} from './ArosBook.parser';

export class ArosScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new ArosBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new ArosBookParser,
        },
      },
    );
  }
}
