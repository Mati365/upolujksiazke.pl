import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {GraniceBookMatcher} from './GraniceBook.matcher';
import {GraniceBookParser} from './GraniceBook.parser';
import {SimpleWebsiteScrapperSpider} from '../../modules/scrapper/service/shared';

export class GraniceScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: SimpleWebsiteScrapperSpider.createForRegexMap(
          [
            [/ksiazka\/\S+\/\d+$/, () => ScrapperMetadataKind.BOOK],
          ],
        ),
        matchers: {
          [ScrapperMetadataKind.BOOK]: new GraniceBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new GraniceBookParser,
        },
      },
    );
  }
}
