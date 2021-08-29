import * as R from 'ramda';
import {ID} from '../types';

export function reduceObjectToIdArray(obj: Record<string, any>): ID[] {
  return R.reduce(
    (acc, item) => {
      acc.push(item);
      return acc;
    },
    [] as ID[],
    R.keys(obj),
  );
}

export function reduceIdArrayToObject(ids: ID[]) {
  return R.reduce(
    (acc, item) => {
      acc[item] = true;
      return acc;
    },
    {} as Record<ID, boolean>,
    ids,
  );
}
