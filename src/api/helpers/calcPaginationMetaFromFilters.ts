import * as R from 'ramda';
import {PaginationMeta} from '@shared/types';

export function calcPaginationMetaFromFilters(filters: PaginationMeta) {
  if (!filters) {
    return {
      totalPages: 0,
      page: 0,
      size: 0,
    };
  }

  const {totalItems, limit, offset} = filters;
  return {
    totalPages: Math.ceil(totalItems / limit),
    page: Math.floor(offset / limit),
    size: limit,
  };
}

export function calcPageOffset(filters: PaginationMeta, page: number) {
  return R.clamp(0, filters.totalItems, page * filters.limit);
}
