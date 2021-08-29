import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {SimpleWebsiteScrapperSpider} from '@scrapper/service/shared';
import {WoblinkBookMatcher} from './WoblinkBook.matcher';
import {WoblinkBookParser} from './WoblinkBook.parser';

export class WoblinkScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
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
