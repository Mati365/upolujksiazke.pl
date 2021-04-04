import {OrderByCondition, SelectQueryBuilder} from 'typeorm';
import {classToPlain} from 'class-transformer';
import * as R from 'ramda';

import {ID} from '@shared/types';

export type BasicLimitPaginationOptions = {
  offset?: number,
  limit: number,
};

export type PaginationOptions = BasicLimitPaginationOptions & {
  serialize?: boolean,
  page?: number,
  phrase?: string,
  excludeIds?: ID[],
};

export type PaginationDangerousOptions = PaginationOptions & {
  unsafe?: {
    order?: OrderByCondition,
    phraseColumn: string,
  },
};

export type PaginationResult<T> = {
  items: (Record<string, any> | T)[],
  meta: {
    limit: number,
    offset: number,
    page?: number,
    totalItems?: number,
    totalPages?: number,
  },
};

function isSortOption(option: string) {
  switch (option?.toLowerCase() || '') {
    case 'asc':
    case 'desc':
      return true;

    default:
      return false;
  }
}

/**
 * @see {@link https://github.com/typeorm/typeorm/issues/3740}
 *
 * @param {OrderByCondition} order
 * @returns
 */
function validateOrder(order: OrderByCondition) {
  return R.reduce(
    (acc, [key, value]) => {
      if (isSortOption(<string> value))
        acc[key] = value;

      return acc;
    },
    {},
    R.toPairs(order),
  );
}

/**
 * Checks if provided arguments are correct
 *
 * @param {PaginationDangerousOptions} {unsafe, limit, offset, page}
 * @returns
 */
function validateOptions({unsafe, limit, offset, page, excludeIds}: PaginationDangerousOptions) {
  return {
    excludeIds: excludeIds && R.take(20, excludeIds),
    order: validateOrder(
      unsafe?.order ?? {
        id: 'DESC',
      },
    ),
    limit: Math.max(0, limit),
    offset: Math.max(0, offset ?? ((page - 1) * limit)),
  };
}

/**
 * Paginate query builder
 *
 * @export
 * @template T
 * @param {SelectQueryBuilder<T>} queryBuilder
 * @param {PaginationDangerousOptions} {phrase, ...options}
 * @param {DangerousPaginationConfig} config
 * @returns {Promise<PaginationResult<T>>}
 */
export async function paginateQueryBuilder<T>(
  queryBuilder: SelectQueryBuilder<T>,
  {phrase, serialize = true, ...options}: PaginationDangerousOptions,
): Promise<PaginationResult<T>> {
  const {order, offset, limit, excludeIds} = validateOptions(options);
  const [items, totalItems] = await (() => {
    const builder = queryBuilder
      .take(limit)
      .skip(offset)
      .orderBy(order);

    if (excludeIds)
      builder.andWhere(`${builder.alias}.id not in (:...excludeIds)`, {excludeIds});

    if (!R.isNil(phrase) && options.unsafe?.phraseColumn)
      builder.andWhere(`LOWER(${options.unsafe.phraseColumn}) like lower(:phrase)`, {phrase: `%${phrase}%`});

    return builder.getManyAndCount();
  })();

  return {
    items: (
      serialize
        ? items.map((item) => classToPlain(item))
        : items
    ),
    meta: {
      offset,
      page: options.page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}
