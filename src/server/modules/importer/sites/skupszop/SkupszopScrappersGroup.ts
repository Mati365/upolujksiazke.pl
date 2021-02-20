import {ScrapperMetadataKind} from '@scrapper/entity';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {SkupszopBookMatcher} from './SkupszopBook.matcher';
import {SkupszopBookParser} from './SkupszopBook.parser';

export class SkupszopScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: SimpleWebsiteScrapperSpider.createForRegexMap(
          [
            [/-id\d+$/, () => ScrapperMetadataKind.BOOK],
          ],
        ),
        matchers: {
          [ScrapperMetadataKind.BOOK]: new SkupszopBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new SkupszopBookParser,
        },
      },
    );
  }
}
