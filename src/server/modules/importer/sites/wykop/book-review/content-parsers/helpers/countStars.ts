import {countBy} from 'ramda';

/**
 * Count all star characters
 *
 * @export
 * @param {string} str
 * @returns
 */
export function countStars(str: string) {
  return countBy(
    (val) => (val === '★' ? 'filled' : 'notFilled'),
    str as any,
  ).filled || 0;
}
