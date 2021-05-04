import {BooksFilters} from '@api/repo';

import {validateMinMaxRange} from '@client/helpers/logic';
import {safePluckObjIds} from '@shared/helpers';

export function serializeAggsToSearchParams(aggs: any): BooksFilters {
  if (!aggs)
    return null;

  const price = validateMinMaxRange(aggs.price);
  return {
    offset: aggs.offset || 0,
    limit: aggs.limit || 30,
    schoolLevels: safePluckObjIds(aggs.schoolLevels),
    types: safePluckObjIds(aggs.types),
    categoriesIds: safePluckObjIds(aggs.categories),
    authorsIds: safePluckObjIds(aggs.authors),
    prizesIds: safePluckObjIds(aggs.prizes),
    genresIds: safePluckObjIds(aggs.genre),
    erasIds: safePluckObjIds(aggs.era),
    publishersIds: safePluckObjIds(aggs.publishers),
    lowestPrice: price?.min || null,
    highestPrice: price?.max || null,
  };
}
