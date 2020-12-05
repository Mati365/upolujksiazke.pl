import * as R from 'ramda';

import {notImplemented} from '@shared/helpers/decorators/noImplemented';

import {ID, SortKeys, CanBeArray} from '@shared/types';
import {APIClient} from '../../utils/APIClient';

export type CountResult = {
  count: number,
};

export type PaginationFilters<F = {}> = F & {
  phrase?: string,
  limit?: number,
  page?: number,
  totalPages?: number,
  totalItems?: number,
  sort?: SortKeys,
};

export const pickPaginationFiltersKeys = R.pick(
  ['phrase', 'limit', 'page', 'totalPages', 'totalItems', 'sort'],
);

export type APIPagination<T, F = {}> = {
  items: T[],
  meta: PaginationFilters<F>,
};

export type APIBulkTarget<F> = {
  all?: boolean,
  filters?: F,
  excludeIds?: ID[],
  includeIds?: ID[]
};

export type APIValidatorResponse<T> = {
  messages: Record<keyof T, string[]>,
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export interface IWrite<T, F> {
  create(item: Partial<T>): Promise<T>;
  update(item: CanBeArray<Partial<T>>): Promise<Partial<T>>;
  updateBulk(target: APIBulkTarget<PaginationFilters<F>>, item: Partial<T>): Promise<void>;
  delete(id: ID): Promise<void>;
  deleteBulk(target: APIBulkTarget<PaginationFilters<F>>): Promise<void>;
}

export interface IRead<T, F> {
  find(item: T): Promise<T>;
  findOne(id: ID): Promise<T>;
  findAll(filters: PaginationFilters<F>): Promise<APIPagination<T, F>>;
  findPlainList(filters?: PaginationFilters<F>): Promise<T[]>;
  count(filters?: PaginationFilters<F>): Promise<number>;
}

export abstract class BaseAPIRepo<T, F = {}> implements IWrite<T, F>, IRead<T, F> {
  constructor(
    protected api: APIClient,
  ) {}

  @notImplemented validate(item: Partial<T>): Promise<APIValidatorResponse<T>> { return null; }
  @notImplemented create(item: Partial<T>): Promise<T> { return null; }
  @notImplemented update(item: CanBeArray<Partial<T>>): Promise<Partial<T>> { return null; }
  @notImplemented updateBulk(
    target: APIBulkTarget<PaginationFilters<F>>,
    item: Partial<T>,
  ): Promise<void> {
    return null;
  }

  @notImplemented delete(id: ID): Promise<void> { return null; }
  @notImplemented deleteBulk(target: APIBulkTarget<PaginationFilters<F>>): Promise<void> { return null; }
  @notImplemented find(item: T): Promise<T> { return null; }
  @notImplemented findOne(id: ID): Promise<T> { return null; }
  @notImplemented findAll(filters: PaginationFilters<F>): Promise<APIPagination<T, F>> { return null; }
  @notImplemented findPlainList(filters?: PaginationFilters<F>): Promise<T[]> { return null; }
  @notImplemented count(filters?: PaginationFilters<F>): Promise<number> { return null; }
}
