import {ScrapperMetadataKind} from '@scrapper/entity';
import {SpiderQueueProxyScrapper} from '@importer/kinds/scrappers';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {BlogspotPostsScrapper} from '../../predefined/BlogspotPosts.scrapper';
import {HrosskarBookSummaryParser} from './HrosskarBookSummary.parser';

export class HrosskarScrappersGroup extends BookShopScrappersGroup {
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
          [ScrapperMetadataKind.BOOK_SUMMARY]: new BlogspotPostsScrapper(
            {
              latestArticlesPath: 'search/label/recenzja',
            },
          ),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_SUMMARY]: new HrosskarBookSummaryParser,
        },
      },
    );
  }
}
