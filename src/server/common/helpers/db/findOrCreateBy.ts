import {ID} from '@shared/types';
import {upsert, UpsertAttrs} from './upsert';

/**
 * Only finds record and if not present create
 *
 * @export
 * @template T
 * @param {UpsertAttrs<T>} attrs
 * @returns
 */
export async function findOrCreateBy<T extends {id?: ID}>(attrs: UpsertAttrs<T>) {
  return upsert<T>(
    {
      ...attrs,
      update: false,
    },
  );
}
