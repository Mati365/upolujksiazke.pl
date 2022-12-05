import {
  EntityTarget, Connection,
  EntityManager, getRepository,
} from 'typeorm';

import {safeArray} from '@shared/helpers/safeArray';
import {CanBeArray} from '@shared/types';

export async function upsert<T, E extends T | T[], K extends keyof T>(
  {
    Entity,
    entityManager,
    connection,
    data,
    constraint,
    primaryKey,
    conflictKeys,
    coalesce = true,
    doNothing,
    updateStr,
    columns,
    skip = ['id', 'createdAt'] as K[],
  }: {
    connection?: Connection,
    entityManager?: EntityManager,
    Entity: EntityTarget<T>,
    data: E,
    constraint?: string,
    conflictKeys?: string,
    updateStr?: string,
    doNothing?: boolean,
    coalesce?: boolean,
    primaryKey?: CanBeArray<(string & keyof T) | `${string & keyof T}Id`>,
    skip?: K[],
    columns?: K[],
  },
): Promise<E> {
  const repo = (
    entityManager
      ? entityManager.getRepository(Entity)
      : getRepository(Entity)
  );

  if (!updateStr) {
    if (doNothing)
      conflictKeys ??= '';
    else {
      const metadata = (connection ?? entityManager.connection).getMetadata(Entity);
      updateStr = !doNothing && (
        metadata
          .columns
          .map(
            ({databaseName: key}) => {
              if (columns && !columns.includes(key as K))
                return null;

              if (skip.includes(key as K))
                return null;

              let assignValue = `EXCLUDED."${key}"`;
              if (coalesce)
                assignValue = `COALESCE(${assignValue}, ${metadata.tableName}."${key}")`;

              return `"${key}" = ${assignValue}`;
            },
          )
          .filter(Boolean)
          .join(',')
      );

      conflictKeys ??= (
        constraint
          ? `on constraint ${constraint}`
          : `(${safeArray(primaryKey).map((col) => `"${col}"`).join(',')})`
      );
    }
  }

  const result = await (
    repo
      .createQueryBuilder()
      .insert()
      .values(data as any)
      .onConflict(`${conflictKeys} ${doNothing ? 'DO NOTHING' : `DO UPDATE SET ${updateStr}`}`)
      .execute()
  );

  if (result.identifiers) {
    safeArray(data).forEach((source, index) => {
      const identifier = result.identifiers[index];

      if (identifier && 'id' in identifier)
        (source as any).id = identifier.id;
    });
  }

  return data;
}
