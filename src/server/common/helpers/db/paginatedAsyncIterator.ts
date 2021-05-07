import {SelectQueryBuilder} from 'typeorm';

import {asyncIteratorToObservable} from '../rx/asyncIteratorToObservable';
import {BasicLimitPaginationOptions} from './pagination';

export type PaginationForwardIteratorAttrs<T> = {
  pageLimit: number,
  maxOffset?: number,
  query?: SelectQueryBuilder<T>,
};

type PaginatedAsyncIterator<T> = BasicLimitPaginationOptions & {
  increment?: boolean,
  maxOffset?: number,
  queryExecutor(
    attrs: {
      limit: number,
      offset: number,
    },
  ): Promise<T[]>,
};

/**
 * Iterates over whole database and yields every page
 *
 * @export
 * @template T
 * @param {PaginatedAsyncIterator<T>} attrs
 */
export async function* paginatedAsyncIterator<T>(
  {
    offset = 0,
    maxOffset = Infinity,
    increment = true,
    limit,
    queryExecutor,
  }: PaginatedAsyncIterator<T>,
): AsyncGenerator<[number, T[]]> {
  while (true) {
    const result: T[] = await queryExecutor(
      {
        offset,
        limit,
      },
    );

    if (!result.length)
      return;

    yield [offset, result];

    if (increment)
      offset += limit;

    if (offset >= maxOffset)
      break;
  }
}

/**
 * Returns RX observable instead iterator
 *
 * @export
 * @template T
 * @param {PaginatedAsyncIterator<T>} attrs
 * @returns
 */
export function paginatedAsyncObservable<T>(attrs: PaginatedAsyncIterator<T>) {
  return asyncIteratorToObservable(
    paginatedAsyncIterator<T>(attrs),
  );
}
