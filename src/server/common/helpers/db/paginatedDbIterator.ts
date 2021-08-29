import {SelectQueryBuilder} from 'typeorm';
import {CanBePromise} from '@shared/types';

import {paginatedAsyncIterator} from './paginatedAsyncIterator';

export type PaginatedDbIterator<T, R> = {
  pageLimit: number,
  maxOffset?: number,
  select?: string[],
  query: SelectQueryBuilder<T>,
  prefix?: string;
  mapperFn?(result: T[]): CanBePromise<R[]>,
};

export type PredefinedEntityDbIterator<T, R> = Omit<PaginatedDbIterator<T, R>, 'prefix' | 'query'> & {
  query?: SelectQueryBuilder<T>,
};

export type IdMappedEntityDbIterator<T> = PredefinedEntityDbIterator<T, number>;

export function createDbIteratedQuery<T, R = T>(
  {
    prefix = 'b',
    select = [`${prefix}.id`],
    pageLimit,
    mapperFn = (items: T[]) => items as any,
    maxOffset = Infinity,
    query,
  }: PaginatedDbIterator<T, R>,
) {
  return paginatedAsyncIterator(
    {
      maxOffset,
      limit: pageLimit,
      queryExecutor: async ({limit, offset}) => mapperFn(
        await query
          .select(select)
          .offset(offset)
          .limit(limit)
          .orderBy(`${prefix}.id`)
          .getMany(),
      ),
    },
  );
}
