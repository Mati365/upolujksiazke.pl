import {Connection, EntityManager} from 'typeorm';
import {runTransactionWithPostHooks} from './runTransactionWithPostHooks';

export function forwardTransaction<R = void>(
  {
    connection,
    entityManager,
    postHooks = true,
  }: {
    connection: Connection,
    entityManager?: EntityManager,
    postHooks?: boolean,
  },
  fn: (transaction: EntityManager) => Promise<R>,
) {
  if (entityManager)
    return fn(entityManager);

  if (postHooks)
    return runTransactionWithPostHooks<R>(connection, fn);

  return connection.transaction(fn);
}
