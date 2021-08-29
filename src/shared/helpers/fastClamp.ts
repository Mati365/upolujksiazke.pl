/**
 * Faster than default ramda implementation clamp
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @param {number} val
 * @returns {number}
 */
export function fastClamp(min: number, max: number, val: number): number {
  return Math.min(Math.max(val, min), max);
}
