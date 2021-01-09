import {ScrapperMetadataKind} from '@scrapper/entity';

import {WbiblioteceBookMatcher} from './WbiblioteceBook.matcher';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '../BookShopScrappersGroup';

export class WbiblioteceScrappersGroup extends BookShopScrappersGroup {
  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        matchers: {
          [ScrapperMetadataKind.BOOK]: new WbiblioteceBookMatcher(options),
        },
      },
    );
  }
}
