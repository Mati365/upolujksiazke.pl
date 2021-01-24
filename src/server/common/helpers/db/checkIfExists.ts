import {EntityManager, ObjectLiteral} from 'typeorm';

export async function checkIfExists(
  {
    tableName,
    entityManager,
    where,
  }: {
    tableName: string,
    entityManager: EntityManager,
    where: ObjectLiteral,
  },
) {
  const count = await (
    entityManager
      .createQueryBuilder(tableName, 'c')
      .where(where)
      .limit(1)
      .getCount()
  );

  return count > 0;
}
