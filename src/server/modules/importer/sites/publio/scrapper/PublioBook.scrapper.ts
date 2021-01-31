import {BookScrapperInfo} from '@server/modules/importer/modules/scrapper/service/scrappers/Book.scrapper';
import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';
import {
  HTMLParserAttrs,
  HTMLScrapper,
  ScrapperResult,
} from '@server/modules/importer/modules/scrapper/service/shared';

import {PublioBookMatcher} from '../matchers/PublioBook.matcher';

/**
 * Spider that walks through publio.pl
 *
 * @export
 * @class PublioBookScrapper
 * @extends {HTMLScrapper<BookScrapperInfo[]>}
 */
export class PublioBookScrapper extends HTMLScrapper<BookScrapperInfo[]> {
  constructor() {
    super(
      {
        pageProcessDelay: 1000,
      },
    );
  }

  protected parsePage(attrs: HTMLParserAttrs): Promise<ScrapperResult<BookScrapperInfo[], string>> {
    console.info('mapSingleItemResponse', attrs);
    return null;
  }

  mapSingleItemResponse(item: any): BookScrapperInfo {
    console.info('mapSingleItemResponse', item);
    return null;
  }

  async fetchSingle(remoteId: string): Promise<BookScrapperInfo> {
    const matcher = <PublioBookMatcher> this.matchers[ScrapperMetadataKind.BOOK];
    await matcher.fetchPageByPath(remoteId);

    return null;
  }

  protected processPage(page: string): Promise<ScrapperResult<BookScrapperInfo[], string>> {
    console.info(page);
    return null;
  }
}
