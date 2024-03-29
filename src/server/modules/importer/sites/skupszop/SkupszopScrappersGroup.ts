import {ScrapperMetadataKind} from '@scrapper/entity';
import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {SkupszopBookMatcher} from './SkupszopBook.matcher';
import {SkupszopBookParser} from './SkupszopBook.parser';

export class SkupszopScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
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
