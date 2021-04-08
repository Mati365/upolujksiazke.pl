import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {mergeWithoutNulls} from '@shared/helpers/mergeWithoutNulls';

export const mergeBooks = (books: CreateBookDto[]) => mergeWithoutNulls(books, (key, a, b) => {
  switch (key) {
    case 'authors':
      return a?.length > b?.length ? a : b;

    case 'series':
    case 'prizes':
    case 'categories':
    case 'tags':
      return [...(a || []), ...(b || [])];

    default:
      return a ?? b;
  }
});
