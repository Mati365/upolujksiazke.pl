import {BooksFilters} from '@api/repo';
import {safePluckObjIds} from '@shared/helpers';

export function serializeAggsToSearchParams(aggs: any): BooksFilters {
  const {meta = {}} = aggs;

  return {
    offset: meta.offset || 0,
    limit: meta.limit || 30,
    schoolLevels: safePluckObjIds(aggs.schoolLevels),
    types: safePluckObjIds(aggs.types),
    categoriesIds: safePluckObjIds(aggs.categories),
    authorsIds: safePluckObjIds(aggs.authors),
    prizesIds: safePluckObjIds(aggs.prizes),
    genresIds: safePluckObjIds(aggs.genre),
    erasIds: safePluckObjIds(aggs.era),
    publishersIds: safePluckObjIds(aggs.publishers),
  };
}
