import {Size, DimensionAxis} from '@shared/types';

/**
 * Reduces array of dimensions object to single summary value
 *
 * @param {DimensionAxis} dimensionProp
 * @param {Size[]} sizes
 * @param {number} [len=sizes.length]
 * @returns {number}
 */
export function sumNthSlidesSize(dimensionProp: DimensionAxis, sizes: Size[], len: number = sizes.length): number {
  let sum = 0;

  for (let i = 0; i < Math.min(sizes.length, len); ++i)
    sum += sizes[i][dimensionProp];

  return sum;
}
