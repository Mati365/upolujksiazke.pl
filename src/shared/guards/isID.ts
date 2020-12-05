import * as R from 'ramda';

/**
 * @todo Check why user defined guards crash webpack
 */
export function isID(item: any): boolean {
  return R.is(String, item) || R.is(Number, item);
}
