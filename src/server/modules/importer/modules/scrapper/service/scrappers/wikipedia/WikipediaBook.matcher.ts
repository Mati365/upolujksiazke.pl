import wiki, {Options} from 'wikijs';

import {BookEntity} from '@server/modules/book/Book.entity';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookScrapperInfo} from '../Book.scrapper';

export type WikipediaAPIOptions = Options;

/**
 * Search over wikipedia for record
 *
 * @export
 * @class WikipediaBookMatcher
 * @implements {ScrapperMatcher<BookScrapperInfo, BookEntity>}
 */
export class WikipediaBookMatcher implements ScrapperMatcher<BookScrapperInfo, BookEntity> {
  constructor(
    private readonly apiOptions: WikipediaAPIOptions,
  ) {}

  async matchRecord(scrapperInfo: BookScrapperInfo): Promise<ScrapperMatcherResult<BookEntity>> {
    const {apiOptions} = this;

    try {
      const page = await wiki(apiOptions).page(scrapperInfo.title);
      console.info(page, await (page as any).content());

      return null;
    } catch (e) {
      return null;
    }
  }
}
