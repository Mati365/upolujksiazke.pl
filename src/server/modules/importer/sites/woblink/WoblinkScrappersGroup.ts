import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {WoblinkBookMatcher} from './WoblinkBook.matcher';
import {WoblinkBookParser} from './WoblinkBook.parser';

export class WoblinkScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: SimpleWebsiteScrapperSpider.createForRegexMap(
          [
            [/\/ksiazka\/.*$/, () => ScrapperMetadataKind.BOOK],
          ],
        ),
        matchers: {
          [ScrapperMetadataKind.BOOK]: new WoblinkBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new WoblinkBookParser,
        },
      },
    );
  }
}
