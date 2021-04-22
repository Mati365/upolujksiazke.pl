import * as R from 'ramda';

import {uniqFlatHashByProp} from '@shared/helpers';

import {APICountedRecord} from '@api/APIRecord';
import {ID} from '@shared/types';

export async function fetchDbAggsRecords<T extends {id: ID}>(
  {
    items,
    fetchFn,
  }: {
    items: any[],
    fetchFn(ids: string[]): Promise<T[]>,
  },
): Promise<APICountedRecord<T>[]> {
  if (!items || R.isEmpty(items))
    return null;

  const entitiesMap = uniqFlatHashByProp(
    'id',
    (await fetchFn(R.pluck('id', items))) || [],
  );

  return items.map(
    ({id, count}) => ({
      record: entitiesMap[id],
      count: count || 0,
    }),
  );
}
