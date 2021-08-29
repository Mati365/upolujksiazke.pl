import React, {useState, useMemo, ReactNode} from 'react';
import {repeat, reduce, times} from 'ramda';

import {Size} from '@shared/types';
import {
  useWindowSize,
  useIsomorphicLayoutEffect,
} from '@client/hooks';

import {
  measureChildenSize,
  findOptimalItemsCount,
} from '../helpers';

/**
 * Returns single slide width
 *
 * @export
 * @param {Object} attrs
 * @returns {SlideSizesInfo}
 */
type SlideSizesInfo = {
  truncatedContainerSize: Size,
  slideSizes: Size[],
  summarySlidesSize: Size,
  nonNullChildren: ReactNode[],
};

type SlideSizesState = Pick<SlideSizesInfo, 'truncatedContainerSize' | 'slideSizes'>;

export function useSlideSizesRef(
  {
    containerRef,
    slideWidth,
    children,
    responsive,
  },
): SlideSizesInfo {
  const windowSize = useWindowSize();

  const nonNullChildren = React.Children.toArray(children).filter((o) => o);
  const childrenCount = nonNullChildren.length;

  const [{truncatedContainerSize, slideSizes}, setSlideSizes] = useState<SlideSizesState>(
    () => ({
      truncatedContainerSize: null,
      slideSizes: !slideWidth ? null : times(
        (): Size => ({
          w: slideWidth,
          h: null,
        }),
        childrenCount,
      ),
    }),
  );

  if (slideWidth && slideSizes) {
    if (slideSizes.length && slideSizes[0].w !== slideWidth) {
      slideSizes.forEach((size) => {
        size.w = slideWidth;
      });
    } else if (slideSizes.length !== childrenCount) {
      slideSizes.splice(0, slideSizes.length);
      times(
        () => {
          slideSizes.push(
            {
              w: slideWidth,
              h: null,
            },
          );
        },
        childrenCount,
      );
    }
  }

  function setCachedSlideSizes(sizes: Size[], containerSize: Size): void {
    const differs = (
      !slideSizes
        || !truncatedContainerSize
        || truncatedContainerSize.w !== containerSize.w
        || truncatedContainerSize.h !== containerSize.h
        || sizes.some((size, index) => {
          const oldSize = slideSizes[index];

          return !oldSize || size.w !== oldSize.w || size.h !== oldSize.h;
        })
    );

    if (differs) {
      setSlideSizes(
        {
          slideSizes: sizes,
          truncatedContainerSize: containerSize,
        },
      );
    }
  }

  useIsomorphicLayoutEffect(
    () => {
      if (!containerRef.current)
        throw new Error('Unable to get size of slider container!');

      const boundingRect = containerRef.current.getBoundingClientRect();
      const newTruncatedContainerSize: Size = {
        w: boundingRect.width,
        h: boundingRect.height,
      };

      if (slideWidth) {
        setSlideSizes(
          (prevState) => ({
            ...prevState,
            truncatedContainerSize: newTruncatedContainerSize,
          }),
        );
        return;
      }

      if (responsive) {
        const mode = findOptimalItemsCount(responsive, newTruncatedContainerSize.w);

        setCachedSlideSizes(
          repeat(
            {
              w: mode.slideWidth ?? (newTruncatedContainerSize.w / mode.items),
              h: newTruncatedContainerSize.h,
            },
            childrenCount,
          ),
          newTruncatedContainerSize,
        );
      } else {
        setCachedSlideSizes(
          measureChildenSize(containerRef.current),
          newTruncatedContainerSize,
        );
      }
    },
    [
      windowSize.w,
      windowSize.h,
      slideWidth,
      childrenCount,
    ],
  );

  const summarySlidesSize = useMemo<Size>(
    () => reduce(
      (acc, size) => {
        acc.w += size.w;
        acc.h = Math.max(acc.h, size.h);
        return acc;
      },
      {
        w: 0,
        h: 0,
      },
      slideSizes || [],
    ),
    [
      slideSizes?.length,
      slideSizes,
      slideWidth,
    ],
  );

  return {
    truncatedContainerSize,
    slideSizes,
    nonNullChildren,
    summarySlidesSize,
  };
}
