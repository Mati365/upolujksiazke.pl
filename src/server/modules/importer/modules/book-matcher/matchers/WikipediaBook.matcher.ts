import wiki, {Options} from 'wikijs';

import {BookScrapperInfo} from '../../scrapper/service/scrappers/Book.scrapper';
import {BookMatcher, BookMatcherResult} from '../BookMatcher.interface';

/**
 * Wikipedia book matcher
 *
 * @see
 *  Edge case (ultiple literature items):
 *  {@link https://en.wikipedia.org/wiki/Hyperion}
 *
 * @export
 * @class WikipediaBookMatcher
 * @implements {BookMatcher}
 */
export class WikipediaBookMatcher implements BookMatcher {
  constructor(
    private readonly apiOptions: Options = {
      apiUrl: 'http://pl.wikipedia.org/w/api.php',
      origin: '*',
    },
  ) {}

  async matchBook(scrapperInfo: BookScrapperInfo): Promise<BookMatcherResult> {
    const {apiOptions} = this;
    const page = await wiki(apiOptions).page(scrapperInfo.title);

    console.info(page, await (page as any).content());
    return null;
  }
}
