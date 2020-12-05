import * as R from 'ramda';

export function safeArray<T>(val: T|T[]) {
  if (R.isNil(val))
    return [];

  if (val instanceof Array)
    return val;

  return [val];
}
