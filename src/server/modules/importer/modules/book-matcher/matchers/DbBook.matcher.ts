import {BookMatcher, BookMatcherResult} from '../BookMatcher.interface';

/**
 * @todo
 *  Add redis support?
 *
 * @export
 * @class DbBookMatcher
 * @implements {BookMatcher}
 */
export class DbBookMatcher implements BookMatcher {
  matchBook(): Promise<BookMatcherResult> {
    return null;
  }
}
