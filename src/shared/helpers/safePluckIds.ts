import * as R from 'ramda';

export function safePluckIds<T>(array: T[]): number[] {
  if (!array)
    return null;

  return R.pluck('id' as any, array) as any;
}

export function safePluckObjIds(obj: any) {
  if (!obj)
    return null;

  if (!R.is(Array, obj))
    obj = R.values(obj);

  return safePluckIds(obj.filter(Boolean));
}
