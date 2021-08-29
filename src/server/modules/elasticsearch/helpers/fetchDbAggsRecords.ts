import * as R from 'ramda';

import {uniqFlatHashByProp} from '@shared/helpers';

import {APICountedBucket} from '@api/APIRecord';
import {ID} from '@shared/types';

export async function fetchDbAggsRecords<T extends {id: ID}>(
  {
    bucket,
    fetchFn,
  }: {
    bucket: APICountedBucket<any>,
    fetchFn(ids: string[]): Promise<T[]>,
  },
): Promise<APICountedBucket<any>> {
  if (!bucket || R.isEmpty(bucket?.items || []))
    return null;

  const {items} = bucket;
  const itemsIds = items.map(({record}) => record.id);
  const entitiesMap = uniqFlatHashByProp(
    'id',
    (await fetchFn(itemsIds)) || [],
  );

  return {
    ...bucket,
    items: items.map(
      ({record, count}) => ({
        record: entitiesMap[record.id],
        count: count || 0,
      }),
    ),
  };
}
