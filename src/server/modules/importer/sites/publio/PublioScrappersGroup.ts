import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {PublioBookMatcher} from './matchers/PublioBook.matcher';
import {PublioBookPublisherMatcher} from './matchers/PublioBookPublisher.matcher';
import {PublioBookParser} from './parsers/PublioBook.parser';
import {PublioPublisherParser} from './parsers/PublioPublisher.parser';
import {PublioSpider} from './spiders/Publio.spider';

export class PublioScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        spider: new PublioSpider,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new PublioBookMatcher(options),
          [ScrapperMetadataKind.BOOK_PUBLISHER]: new PublioBookPublisherMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new PublioBookParser,
          [ScrapperMetadataKind.BOOK_PUBLISHER]: new PublioPublisherParser,
        },
      },
    );
  }
}
