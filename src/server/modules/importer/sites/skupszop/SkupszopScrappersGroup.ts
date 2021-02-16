import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {SkupszopSpider} from './Skupszop.spider';
import {SkupszopBookMatcher} from './SkupszopBook.matcher';
import {SkupszopBookParser} from './SkupszopBook.parser';

export class SkupszopScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: new SkupszopSpider,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new SkupszopBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new SkupszopBookParser(options),
        },
      },
    );
  }
}
