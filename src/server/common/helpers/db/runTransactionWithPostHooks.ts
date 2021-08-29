import {Connection, EntityManager} from 'typeorm';

export type UpsertResourceAttrs = {
  upsertResources?: boolean,
  entityManager?: PostHookEntityManager,
};

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

  for await (const queueFn of queue) {
    try {
      await queueFn();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return result;
}

type HookPromiseFunction = (em: EntityManager) => Promise<void>;

/**
 *Pushes fn to post transaction stack if present
 *
 * @export
 * @param {Object} attrs
 * @param {HookPromiseFunction} fn
 * @returns {Promise<void>}
 */
export async function runInPostHookIfPresent(
  {
    transactionManager,
    runInNewTransaction,
  }: {
    transactionManager: PostHookEntityManager,
    runInNewTransaction?: boolean,
  },
  fn: HookPromiseFunction,
): Promise<void> {
  if (!transactionManager.pushPostTransactionHook)
    return fn(transactionManager);

  transactionManager.pushPostTransactionHook(
    async () => {
      if (runInNewTransaction) {
        await transactionManager.connection.transaction(fn);
        return;
      }

      await fn(
        transactionManager.connection.createEntityManager(),
      );
    },
  );

  return Promise.resolve();
}
