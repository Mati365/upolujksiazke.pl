import {EntityData, FilterQuery, UniqueConstraintViolationException, wrap} from '@mikro-orm/core';
import {EntityRepository} from '@mikro-orm/postgresql';

import {ID} from '@shared/types';

export type UpsertAttrs<T> = {
  repository: EntityRepository<T>,
  where?: FilterQuery<T>,
  data: EntityData<T>,
  update?: boolean,
};

/**
 * Updates or creates object based on data.id or where condition.
 *
 * @todo
 *  Use ON CONFLICT in create after fix this issue:
 *  {@link https://github.com/mikro-orm/mikro-orm/issues/1240}
 *
 * @export
 * @template T
 * @param {UpsertAttrs<T>} attrs
 * @returns
 */
export async function upsert<T extends {id?: ID}>(
  {
    update = true,
    repository,
    where,
    data,
  }: UpsertAttrs<T>,
) {
  const prevEntity = await repository.findOne(
    where ?? data.id,
  );

  // update
  if (prevEntity) {
    if (update) {
      wrap(prevEntity).assign(data);
      await repository.persistAndFlush(prevEntity);
    }

    return prevEntity;
  }

  // create new
  try {
    await repository.persistAndFlush(
      repository.create(data),
    );
  } catch (e) {
    if (e instanceof UniqueConstraintViolationException) {
      return repository.findOne(
        where ?? data.id,
      );
    }

    throw e;
  }

  return data;
}
