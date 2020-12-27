import {EntityTarget, Connection, getRepository} from 'typeorm';

import {safeArray} from '@shared/helpers/safeArray';
import {CanBeArray} from '@shared/types';

export async function upsert<T>(
  {
    Entity,
    connection,
    data,
    constraint,
    primaryKey,
  }: {
    connection: Connection,
    Entity: EntityTarget<T>,
    data: CanBeArray<T>,
    constraint?: string,
    primaryKey?: CanBeArray<(string & keyof T) | `${string & keyof T}Id`>,
  },
): Promise<T[]> {
  const repo = getRepository(Entity);
  const updateStr = (
    connection
      .getMetadata(Entity)
      .columns
      .map(({databaseName: key}) => `"${key}" = EXCLUDED."${key}"`)
      .join(',')
  );

  const conflictKeys = (
    constraint
      ? `on constraint ${constraint}`
      : `(${safeArray(primaryKey).map((col) => `"${col}"`).join(',')})`
  );

  const result = await (
    repo
      .createQueryBuilder()
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

  return safeArray(data);
}
