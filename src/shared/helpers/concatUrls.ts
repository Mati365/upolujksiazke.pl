import * as R from 'ramda';

export const isAbsoluteURL = R.test(/^https?:\/\//);

/**
 * Concat two urls and fixes double slashes
 *
 * @export
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
export function concatUrls(a: string, b: string): string {
  if (!a && b)
    return b;

  if (!b || b === '/')
    return a;

  if (b.startsWith('//'))
    b = `https:${b}`;

  if (!a || isAbsoluteURL(b))
    return b;

  return [
    R.endsWith('/', a) ? R.init(a) : a,
    R.startsWith('/', b) ? R.tail(b) : b,
  ].join('/');
}

/**
 * Combines array of urls
 *
 * @export
 * @param {string[]} parts
 * @return {string}
 */
export function concatUrlParts(parts: string[]): string {
  return (parts || []).reduce(
    (acc, item) => concatUrls(acc, item),
    null,
  );
}
