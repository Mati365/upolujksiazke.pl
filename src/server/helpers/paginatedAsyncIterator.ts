type PaginatedAsyncIterator<T> = {
  offset?: number,
  limit: number,
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
    offset += limit;
  }
}
