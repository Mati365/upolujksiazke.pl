export function findMap<T, R>(
  fn: (value: T, index?: number) => ({
    found: boolean,
    value: R,
  }),
  array: T[],
) {
  if (!array)
    return null;

  for (let i = 0; i < array.length; ++i) {
    const result = fn(array[i], i);
    if (result && result.found)
      return result.value;
  }

  return null;
}
