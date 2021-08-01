import {ScrapperMetadataKind} from '@scrapper/entity';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {SpiderQueueProxyScrapper} from '@importer/kinds/scrappers';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {BlogspotPostsScrapper} from '../../predefined/BlogspotPosts.scrapper';
import {KrytycznymOkiemBookSummaryParser} from './KrytycznymOkiemBookSummary.parser';

export class KrytycznymOkiemScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(config: DefaultScrappersGroupConfig) {
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
