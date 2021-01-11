import {
  EntityTarget, Connection,
  getRepository, SelectQueryBuilder,
  EntityManager,
} from 'typeorm';

import {safeArray} from '@shared/helpers/safeArray';
import {CanBeArray} from '@shared/types';

export async function upsert<T, E extends T | T[], K extends keyof T>(
  {
    Entity,
    entityManager,
    queryBuilder,
    connection,
    data,
    constraint,
    primaryKey,
    conflictKeys,
    skip = ['id', 'createdAt'] as K[],
  }: {
    connection: Connection,
    entityManager?: EntityManager,
    Entity: EntityTarget<T>,
    queryBuilder?: SelectQueryBuilder<T>,
    data: E,
    constraint?: string,
    conflictKeys?: string,
    primaryKey?: CanBeArray<(string & keyof T) | `${string & keyof T}Id`>,
    skip?: K[],
  },
): Promise<E> {
  const repo = (
    entityManager
      ? entityManager.getRepository(Entity)
      : getRepository(Entity)
  );

  const updateStr = (
    connection
      .getMetadata(Entity)
      .columns
      .map(
        ({databaseName: key}) => (
          skip.includes(key as K)
            ? null
            : `"${key}" = EXCLUDED."${key}"`
        ),
      )
      .filter(Boolean)
      .join(',')
  );

  conflictKeys ??= (
    constraint
      ? `on constraint ${constraint}`
      : `(${safeArray(primaryKey).map((col) => `"${col}"`).join(',')})`
  );

  const result = await (
    (repo.createQueryBuilder() || queryBuilder)
      .insert()
      .values(data)
      .onConflict(`${conflictKeys} DO UPDATE SET ${updateStr}`)
      .execute()
  );

  if (result.identifiers) {
    safeArray(data).forEach((source) => {
      if ('id' in source)
        (source as any).id = result.identifiers[0].id;
    });
  }

  return data;
}
