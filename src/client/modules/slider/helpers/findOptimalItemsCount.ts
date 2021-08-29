import {reduce} from 'ramda';

export type ResponsiveSlideInfo = {
  screen: number,
  items: number,
  slideWidth?: number,
};

/**
 * Finds slots count that can be fit inside container width
 *
 * @param {ResponsiveSlideInfo[]} responsiveList
 * @param {number} width
 * @returns {ResponsiveSlideInfo}
 */
export function findOptimalItemsCount(responsiveList: ResponsiveSlideInfo[], width: number): ResponsiveSlideInfo {
  return reduce(
    (acc, item) => {
      if (!acc || item.screen < width)
        return item;

      return acc;
    },
    <ResponsiveSlideInfo> null,
    responsiveList,
  );
}
