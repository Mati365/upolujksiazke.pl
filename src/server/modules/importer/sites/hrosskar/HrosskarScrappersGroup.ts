import {ScrapperMetadataKind} from '@scrapper/entity';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {BlogspotPostsScrapper} from '../../predefined/BlogspotPosts.scrapper';
import {HrosskarBookReviewParser} from './HrosskarBookReview.parser';

export class HrosskarScrappersGroup extends BookShopScrappersGroup {
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
          [ScrapperMetadataKind.BOOK_REVIEW]: new BlogspotPostsScrapper(
            {
              latestArticlesPath: 'search/label/recenzja',
            },
          ),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK_REVIEW]: new HrosskarBookReviewParser,
        },
      },
    );
  }
}
