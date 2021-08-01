import {ScrapperMetadataKind} from '@scrapper/entity';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {DadadaBookMatcher} from './DadadaBook.matcher';
import {DadadaBookParser} from './DadadaBook.parser';

export class DadadaScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: SimpleWebsiteScrapperSpider.createForRegexMap(
          [
            [/,p\d+$/, () => ScrapperMetadataKind.BOOK],
          ],
        ),
        matchers: {
          [ScrapperMetadataKind.BOOK]: new DadadaBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new DadadaBookParser,
        },
      },
    );
  }
}
