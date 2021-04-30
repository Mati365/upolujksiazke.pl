import * as R from 'ramda';

export function safePluckIds<T>(array: T[]): number[] {
  if (!array)
    return null;

  return R.pluck('id' as any, array) as any;
}
