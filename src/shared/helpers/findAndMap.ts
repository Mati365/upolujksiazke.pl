import * as R from 'ramda';

export function findAndMap<T, O>(
  fn: (item: T) => O,
  array: T[],
) {
  for (let i = 0; i < array.length; ++i) {
    const mapped = fn(array[i]);
    if (!R.isNil(mapped))
      return mapped;
  }

  return null;
}
