import * as R from 'ramda';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {mergeWithoutNulls} from '@shared/helpers/mergeWithoutNulls';

export function mergeBooks(books: CreateBookDto[]) {
  if (books.length === 1)
    return books[0];

  return mergeWithoutNulls(books, (key, a, b) => {
    switch (key) {
      case 'scrappersIds':
        return R.uniq([...(a || []), ...(b || [])]);

      case 'series':
      case 'prizes':
      case 'categories':
      case 'tags':
        return [...(a || []), ...(b || [])];

      default:
        return a ?? b;
    }
  });
}
