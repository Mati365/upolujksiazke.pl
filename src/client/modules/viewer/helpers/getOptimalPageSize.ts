import {mean, isNil, pluck, reject} from 'ramda';

import {Size} from '@shared/types';
import {Vector} from '@shared/helpers/types/Vector';

type RatioItem = {
  ratio: number
};

function findPagesRatio(pages: RatioItem[]): number {
  return mean(
    reject(isNil, pluck('ratio', pages)),
  );
}

/**
 * Calculates best single page width / height based on container size
 *
 * @param {RatioItem[]}  pages
 * @param {Dimensions}    containerSize
 * @param {Vec2}          margin
 */
export function getOptimalPagesSize(
  pages: RatioItem[],
  containerSize: Size,
  margin: Vector = new Vector,
) {
  const ratio = findPagesRatio(pages);
  if (Number.isNaN(ratio))
    return containerSize;

  const marginSize: Size = {
    w: containerSize.w - (margin.x * 2),
    h: containerSize.h - (margin.y * 2),
  };

  const mode = pages.length;
  const size: Size = {
    w: marginSize.h * ratio * mode,
    h: marginSize.h,
  };

  /**
   * it is slow but it should work on every paper
   *
   * @todo Check if there will be way to handle it
   */
  for (;;) {
    if (size.w > marginSize.w) {
      size.w = marginSize.w;
      size.h = (size.w / mode) * (1.0 / ratio);
    }

    if (size.h > marginSize.h) {
      size.h = marginSize.h;
      size.w = size.h * ratio;
    } else
      break;
  }

  size.w /= mode;
  return size;
}
