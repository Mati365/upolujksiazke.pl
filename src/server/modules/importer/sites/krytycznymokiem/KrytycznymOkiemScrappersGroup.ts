import {ScrapperMetadataKind} from '@scrapper/entity';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {SpiderQueueProxyScrapper} from '@importer/kinds/scrappers';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {BlogspotPostsScrapper} from '../../predefined/BlogspotPosts.scrapper';
import {KrytycznymOkiemBookReviewParser} from './KrytycznymOkiemBookReview.parser';

export class KrytycznymOkiemScrappersGroup extends BookShopScrappersGroup {
  constructor(config: BookShopScrappersGroupConfig) {
    super(
      {
        ...config,
        spider: SimpleWebsiteScrapperSpider.createForRegexMap(
          [
            [/\d+\/\d+\/[^/]+/, () => ScrapperMetadataKind.BOOK_REVIEW],
          ],
        ),
        scrappers: {
          [ScrapperMetadataKind.URL]: new SpiderQueueProxyScrapper,
          [ScrapperMetadataKind.BOOK_REVIEW]: new BlogspotPostsScrapper,
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_REVIEW]: new KrytycznymOkiemBookReviewParser,
        },
      },
    );
  }
}
