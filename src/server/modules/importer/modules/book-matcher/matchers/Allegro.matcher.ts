import {BookMatcher, BookMatcherResult} from '../BookMatcher.interface';

export class AllegroBookMatcher implements BookMatcher {
  matchBook(): Promise<BookMatcherResult> {
    return null;
  }
}
