import {asyncIteratorToObservable} from '../rx/asyncIteratorToObservable';

type PaginatedAsyncIterator<T> = {
  offset?: number,
  limit: number,
  increment?: boolean,
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
