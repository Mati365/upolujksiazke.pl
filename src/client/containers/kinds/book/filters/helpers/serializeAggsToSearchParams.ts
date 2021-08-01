import {validateMinMaxRange} from '@client/helpers/logic';
import {safePluckObjIds} from '@shared/helpers';
import {serializeFiltersToSearchParams} from '@api/helpers';

import {BooksFilters} from '@api/repo';
import {SortMode, ViewMode} from '@shared/enums';

export function serializeAggsToSearchParams(aggs: any): BooksFilters {
  if (!aggs)
    return null;

  const price = validateMinMaxRange(aggs.price);
  return {
    ...serializeFiltersToSearchParams(aggs),
    sort: +(aggs.sort ?? SortMode.ACCURACY),
    selectDescription: +aggs.viewMode === ViewMode.LIST,
    parentCategoriesIds: aggs.parentCategoriesIds || safePluckObjIds(aggs.parentCategories),
    tagsIds: aggs.tagsIds || safePluckObjIds(aggs.tags),
    schoolLevels: safePluckObjIds(aggs.schoolLevels),
    types: safePluckObjIds(aggs.types),
    categoriesIds: aggs.categoriesIds || safePluckObjIds(aggs.categories),
    authorsIds: safePluckObjIds(aggs.authors),
    prizesIds: safePluckObjIds(aggs.prizes),
    genresIds: safePluckObjIds(aggs.genre),
    erasIds: safePluckObjIds(aggs.era),
    publishersIds: safePluckObjIds(aggs.publishers),
    lowestPrice: price?.min || null,
    highestPrice: price?.max || null,
  };
}
