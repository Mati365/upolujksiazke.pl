import {Connection, EntityManager} from 'typeorm';

type VoidPromiseFunction = () => Promise<void>;

export interface PostHookEntityManager extends EntityManager {
  pushPostTransactionHook?(fn: VoidPromiseFunction): void,
}

/**
 * Executes transaction and if everything is OK executes queue fn.
 * It is used in attachment saving which should be done
 * after transaction is done
 *
 * @export
 * @template T
 * @param {Connection} connection
 * @param {(em: PostHookEntityManager) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function runTransactionWithPostHooks<T>(
  connection: Connection,
  fn: (em: PostHookEntityManager) => Promise<T>,
): Promise<T> {
  const queue: VoidPromiseFunction[] = [];
  const result = await connection.transaction<T>(
    (entityManager) => {
      (<PostHookEntityManager> entityManager).pushPostTransactionHook = (queueFn) => {
        queue.push(queueFn);
      };

      return fn(entityManager);
    },
  );

  // maybe exec parallel?
  for await (const queueFn of queue)
    await queueFn();

  return result;
}

type HookPromiseFunction = (em: EntityManager) => Promise<void>;

/**
 * Pushes fn to post transaction stack if present
 *
 * @export
 * @param {PostHookEntityManager} transactionManager
 * @param {HookPromiseFunction} fn
 * @returns {Promise<void>}
 */
export async function runInPostHookIfPresent(
  transactionManager: PostHookEntityManager,
  fn: HookPromiseFunction,
): Promise<void> {
  if (!transactionManager.pushPostTransactionHook)
    return fn(transactionManager);

  transactionManager.pushPostTransactionHook(
    () => transactionManager.connection.transaction(fn),
  );

  return Promise.resolve();
}
