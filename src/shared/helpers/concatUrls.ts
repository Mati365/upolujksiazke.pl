import * as R from 'ramda';

/**
 * Concat two urls and fixes double slashes
 *
 * @export
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
export function concatUrls(a: string, b: string): string {
  if (!b || b === '/')
    return a;

  return [
    R.endsWith('/', a) ? R.init(a) : a,
    R.startsWith('/', b) ? R.tail(b) : b,
  ].join('/');
}
