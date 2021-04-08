import * as R from 'ramda';

export function getNextObjKey(prevKey: string|number, obj: any) {
  let nextKey = false;

  if (R.is(Number, prevKey))
    prevKey = prevKey.toString();

  for (const key in obj) {
    if (key === prevKey)
      nextKey = true;
    else if (nextKey)
      return key;
  }

  return null;
}
