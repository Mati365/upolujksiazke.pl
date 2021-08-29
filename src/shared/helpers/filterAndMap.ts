import * as R from 'ramda';

export function filterAndMap<T, O>(
  fn: (item: T) => O,
  array: T[],
) {
  const result: O[] = [];

  for (let i = 0; i < array.length; ++i) {
    const mapped = fn(array[i]);
    if (!R.isNil(mapped))
      result.push(mapped);
  }

  return result;
}
