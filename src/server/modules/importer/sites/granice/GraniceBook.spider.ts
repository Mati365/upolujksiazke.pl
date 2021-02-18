import {matchByRegex, RegExpMatchArray} from '@shared/helpers/matchByRegex';

import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity/ScrapperMetadata.entity';
import {WebsiteScrapperSpider} from '@server/modules/importer/modules/scrapper/service/shared/WebsiteScrapperSpider';

export class GraniceSpider extends WebsiteScrapperSpider {
  public static readonly URL_KIND_MATCHER_REGEXS: Readonly<RegExpMatchArray<number>> = Object.freeze(
    [
      [/ksiazka\/\S+\/\d+$/, () => ScrapperMetadataKind.BOOK],
    ],
  );

  /**
   * @inheritdoc
   */
  matchResourceKindByPath(path: string): ScrapperMetadataKind {
    return matchByRegex(
      GraniceSpider.URL_KIND_MATCHER_REGEXS,
      path,
    );
  }
}
