import * as R from 'ramda';

import {mergeWithoutNulls} from '@shared/helpers/mergeWithoutNulls';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

export function mergeBooks(books: CreateBookDto[]) {
  if (books.length === 1)
    return books[0];

  return mergeWithoutNulls(books, (key, a, b) => {
    switch (key) {
      case 'defaultTitle':
      case 'authors':
        return a?.length && (!b || a.length < b.length) ? a : b;

      case 'releases':
        return R.uniqBy(R.prop('isbn'), [...(a || []), ...(b || [])]);

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
