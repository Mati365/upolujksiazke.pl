import {matchByRegex} from '@shared/helpers/matchByRegex';

import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity/ScrapperMetadata.entity';
import {WebsiteScrapperSpider} from '@server/modules/importer/modules/scrapper/service/shared/WebsiteScrapperSpider';

export class PublioSpider extends WebsiteScrapperSpider {
  /**
   * @inheritdoc
   */
  matchResourceKindByPath(path: string): ScrapperMetadataKind {
    return matchByRegex(
      {
        ',p\\d+.html$': () => ScrapperMetadataKind.BOOK,
      },
      path,
    );
  }
}
