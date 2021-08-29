/**
 * Convert number only if has floating digits
 *
 * @example
 *  7.6 = 6.6
 *  7 => 7
 *
 * @export
 * @param {number} number
 * @param {number} digits
 * @returns
 */
export function toFixedIfFloating(number: number, digits: number) {
  if (!digits)
    return number.toFixed(digits);

  return number.toFixed(digits).replace(/\.?0+$/, '');
}
