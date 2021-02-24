import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {GandalfBookMatcher} from './GandalfBook.matcher';
import {GandalfBookParser} from './GandalfBook.parser';

export class GandalfScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new GandalfBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new GandalfBookParser,
        },
      },
    );
  }
}
