/**
 * Fast compare items in array
 *
 * @export
 * @template T
 * @param {T[]} a
 * @param {T[]} b
 * @returns {boolean}
 */
export function shallowCompareArrays<T>(a: T[], b: T[]): boolean {
  if (a === b)
    return true;

  if (!!a !== !!b || a.length !== b.length)
    return false;

  for (let i = a.length - 1; i >= 0; --i) {
    if (a[i] !== b[i])
      return false;
  }

  return true;
}
