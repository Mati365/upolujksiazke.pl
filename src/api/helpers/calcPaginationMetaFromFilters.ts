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

  const {
    limit,
    totalItems = 0,
    offset = 0,
  } = filters;

  return {
    totalPages: Math.ceil(totalItems / limit),
    page: Math.ceil(offset / limit),
    size: limit,
  };
}

export function calcPageOffset(filters: PaginationMeta, page: number) {
  const {totalPages} = calcPaginationMetaFromFilters(filters);

  return R.clamp(0, Math.max(0, totalPages - 1), page) * filters.limit;
}
