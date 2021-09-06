import * as R from 'ramda';

/**
 * Transforms number into stars row
 *
 * @export
 * @param {number} total
 * @return {string}
 */
export function formatRatingStars(total: number, maxStars: number = 10): string {
  if (R.isNil(total))
    return '';

  const mapepdTotal = (
    maxStars === 10
      ? total
      : (total / 10) * maxStars
  );

  const stars = (
    R
      .times(
        (i) => (
          i >= mapepdTotal
            ? '☆'
            : '★'
        ),
        maxStars,
      ).join('')
  );

  return `${stars} (${total.toFixed(1)} / 10)`;
}
