import * as R from 'ramda';
import {ListItem} from '@shared/types';

export function isListItem(item: any): item is ListItem {
  return R.is(Object, item) && ('id' in item || 'name' in item);
}
