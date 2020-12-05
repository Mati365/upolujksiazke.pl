import * as R from 'ramda';
import {ID} from '../types';

export function removeById<V>(id: ID, items: V[]): V[] {
  return <any> R.reject(
    R.propEq('id', id),
    <any> items,
  );
}
