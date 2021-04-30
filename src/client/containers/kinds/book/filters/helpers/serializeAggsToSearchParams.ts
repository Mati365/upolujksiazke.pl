import * as R from 'ramda';
import {BooksFilters} from '@api/repo';

export function safePluckObjIds(obj: any) {
  if (!obj)
    return null;

  return R.pluck('id', R.values(obj).filter(Boolean));
}

export function serializeAggsToSearchParams(aggs: any): BooksFilters {
  return {
    types: aggs.types,
    schoolBook: aggs.schoolBook,
    categoriesIds: safePluckObjIds(aggs.categories),
    authorsIds: safePluckObjIds(aggs.authors),
    prizesIds: safePluckObjIds(aggs.prizes),
    genresIds: safePluckObjIds(aggs.genres),
    erasIds: safePluckObjIds(aggs.era),
    publishersIds: safePluckObjIds(aggs.publishers),
  };
}
