import {ScrapperMetadataKind} from '@scrapper/entity';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {SpiderQueueProxyScrapper} from '@importer/kinds/scrappers';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {BlogspotPostsScrapper} from '../../predefined/BlogspotPosts.scrapper';
import {KrytycznymOkiemBookSummaryParser} from './KrytycznymOkiemBookSummary.parser';

export class KrytycznymOkiemScrappersGroup extends BookShopScrappersGroup {
  constructor(config: BookShopScrappersGroupConfig) {
    super(
      {
        ...config,
        spider: SimpleWebsiteScrapperSpider.createForRegexMap(
          [
            [/\d+\/\d+\/[^/]+/, () => ScrapperMetadataKind.BOOK_SUMMARY],
          ],
        ),
        scrappers: {
          [ScrapperMetadataKind.URL]: new SpiderQueueProxyScrapper,
          [ScrapperMetadataKind.BOOK_SUMMARY]: new BlogspotPostsScrapper,
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new KrytycznymOkiemBookSummaryParser,
        },
      },
    );
  }
}
