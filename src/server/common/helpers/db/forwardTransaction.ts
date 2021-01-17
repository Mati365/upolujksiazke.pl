import {Connection, EntityManager} from 'typeorm';

export function forwardTransaction<R = void>(
  {
    connection,
    entityManager,
  }: {
    connection: Connection,
    entityManager?: EntityManager,
  },
  fn: (transaction: EntityManager) => Promise<R>,
) {
  if (entityManager)
    return fn(entityManager);

  return connection.transaction(fn);
}
