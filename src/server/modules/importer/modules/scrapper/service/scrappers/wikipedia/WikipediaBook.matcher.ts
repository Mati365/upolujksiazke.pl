import wiki, {Options} from 'wikijs';

import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookScrapperInfo} from '../Book.scrapper';

export type WikipediaAPIOptions = Options;

export class WikipediaBookMatcher extends ScrapperMatcher<BookScrapperInfo> {
  constructor(
    private readonly apiOptions: WikipediaAPIOptions,
  ) {
    super();
  }

  async matchRecord(scrapperInfo: BookScrapperInfo): Promise<ScrapperMatcherResult<BookScrapperInfo>> {
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
