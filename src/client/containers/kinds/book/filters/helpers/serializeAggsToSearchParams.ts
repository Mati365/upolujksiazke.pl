import {validateMinMaxRange} from '@client/helpers/logic';
import {safePluckObjIds} from '@shared/helpers';

import {BooksFilters} from '@api/repo';
import {SortMode} from '@shared/enums';

export function serializeAggsToSearchParams(aggs: any): BooksFilters {
  if (!aggs)
    return null;

  const price = validateMinMaxRange(aggs.price);
  return {
    sort: +(aggs.sort ?? SortMode.ACCURACY),
    offset: aggs.offset || 0,
    limit: aggs.limit || 30,
    phrase: aggs.phrase,
    parentCategoriesIds: aggs.parentCategoriesIds,
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
