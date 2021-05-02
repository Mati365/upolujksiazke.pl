import {BooksFilters} from '@api/repo';
import {safePluckObjIds} from '@shared/helpers';

export function serializeAggsToSearchParams(aggs: any): BooksFilters {
  return {
    schoolBook: aggs.schoolBook,
    types: safePluckObjIds(aggs.types),
    categoriesIds: safePluckObjIds(aggs.categories),
    authorsIds: safePluckObjIds(aggs.authors),
    prizesIds: safePluckObjIds(aggs.prizes),
    genresIds: safePluckObjIds(aggs.genre),
    erasIds: safePluckObjIds(aggs.era),
    publishersIds: safePluckObjIds(aggs.publishers),
  };
}
