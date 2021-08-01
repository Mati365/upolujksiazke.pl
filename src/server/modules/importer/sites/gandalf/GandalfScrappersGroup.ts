import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {GandalfBookMatcher} from './GandalfBook.matcher';
import {GandalfBookParser} from './GandalfBook.parser';

export class GandalfScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(options: DefaultScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new GandalfBookMatcher(options),
        },
        parsers: {
          [ScrapperMetadataKind.BOOK]: new GandalfBookParser,
        },
      },
    );
  }
}
