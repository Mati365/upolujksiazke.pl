import * as R from 'ramda';

/**
 * Combines two book reviews
 *
 * @static
 * @param {T} a
 * @param {T} b
 * @returns {T}
 * @memberof WykopEntryContentParser
 */
export function mergeNonNullProperties<T>(
  a: T,
  b: T,
): T {
  return R.mergeWith(
    (_a, _b) => _a ?? _b,
    a,
    b,
  );
}
