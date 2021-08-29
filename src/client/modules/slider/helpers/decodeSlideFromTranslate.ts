import {Size, DimensionAxis} from '@shared/types';

/**
 * Gets slide index from provided translate
 *
 * @param {DimensionAxis} dimensionProp
 * @param {Size[]} sizes
 * @param {number} translate
 * @returns {number}
 */
export function decodeSlideFromTranslate(dimensionProp: DimensionAxis, sizes: Size[], translate: number): number {
  let sum = 0;
  for (let i = 0; i < sizes.length; ++i) {
    sum += sizes[i][dimensionProp];

    if (translate < sum)
      return i;
  }

  return sizes.length - 1;
}
