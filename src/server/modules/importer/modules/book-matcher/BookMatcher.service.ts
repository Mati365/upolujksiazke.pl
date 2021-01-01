import {Injectable} from '@nestjs/common';

import {BookScrapperInfo} from '../scrapper/service/scrappers/Book.scrapper';
import {BookMatcher, BookMatcherResult} from './BookMatcher.interface';
import {
  AllegroBookMatcher,
  DbBookMatcher,
  WikipediaBookMatcher,
} from './matchers';

@Injectable()
export class BookMatcherService implements BookMatcher {
  private static readonly matchers = [
    new DbBookMatcher,
    new WikipediaBookMatcher,
    new AllegroBookMatcher,
  ];

  async matchBook(scrapperInfo: BookScrapperInfo): Promise<BookMatcherResult> {
    for await (const matcher of BookMatcherService.matchers) {
      const result = matcher.matchBook(scrapperInfo);
      if (result)
        return result;
    }

    return null;
  }
}
