import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {LegimiBookMatcher} from './LegimiBook.matcher';
import {LegimiBookParser} from './LegimiBook.parser';

export class LegimiScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: SimpleWebsiteScrapperSpider.createForRegexMap(
          [
            [/\/ebook-*$/, () => ScrapperMetadataKind.BOOK],
          ],
        ),
        matchers: {
          [ScrapperMetadataKind.BOOK]: new LegimiBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new LegimiBookParser,
        },
      },
    );
  }
}
