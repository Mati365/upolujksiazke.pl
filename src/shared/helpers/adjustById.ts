import * as R from 'ramda';
import {ID} from '../types';

export function adjustById<T extends {id?: ID}>(id: ID, fn: (prev: T) => T, list: T[]) {
  const index = (list || []).findIndex((item) => item.id === id);
  if (index === -1)
    return [...list];

  return R.adjust(index, fn, list);
}
