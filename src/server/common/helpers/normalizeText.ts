import * as R from 'ramda';
import {
  truncateText,
  safeToString,
} from '@shared/helpers';

export const normalizeParsedText: (str: string) => string = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/[ ]{2,}/g, ' '),
    R.replace(/[\n]{2,}/g, '\n'),
    R.trim,
    R.when<string, string>(R.isEmpty, R.always(null)),
  ),
);

export const normalizeISBN = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/-/g, ''),
    R.trim,
  ),
);

export const normalizeURL = R.unless(
  R.isNil,
  R.when(
    R.startsWith('//'),
    R.concat('https:'),
  ),
);

export function normalizePrice(str: string) {
  if (!str)
    return null;

  const [, value, currency] = R.match(
    /(\d+[.,]\d+)\s*(\S+)?/,
    normalizeParsedText(str),
  );

  if (R.isNil(value) && R.isNil(currency))
    return null;

  return {
    price: Number.parseFloat(value.replace(',', '.')), // it should be decimal?
    currency: currency?.toLowerCase(),
  };
}

/**
 * Extracts year from date
 *
 * @export
 * @param {string | number} str
 * @return {number}
 */
export function normalizeParsedYear(str: string | number): number {
  if (R.is(Number, str))
    str = safeToString(str);

  return str && new Date((<string> str).match(/\d{4}/)?.[0]).getFullYear();
}

/**
 * Due to limit of levenshtein DB column it must be truncated
 *
 * @export
 * @param {string} str
 * @return {string}
 */
export function truncateLevenshteinText(str: string): string {
  return truncateText(245, str?.trim());
}
