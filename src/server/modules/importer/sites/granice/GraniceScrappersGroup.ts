import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {GraniceBookMatcher} from './GraniceBook.matcher';
import {GraniceBookParser} from './GraniceBook.parser';
import {SimpleWebsiteScrapperSpider} from '../../modules/scrapper/service/shared';

export class GraniceScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
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
