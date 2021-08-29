import React, {memo, useMemo} from 'react';
import {pick} from 'ramda';

import {stopPropagation} from '@client/helpers/html';
import {Size} from '@shared/types';

import {useZoom} from '../hooks/useZoom';
import {useViewerContext} from '../context/viewerContext';
import {
  filterImagePages,
  getOptimalPagesSize,
} from '../helpers';

import {BrochurePagesChunk} from '../context/utils';
import {ViewerPage} from './ViewerPage';

export type ViewerSlideRef = {
  onClickRightArrow(): boolean;
  onClickLeftArrow(): boolean;
};

type ViewerSlideProps = {
  parentSize?: Size,
  slide: BrochurePagesChunk,
  active?: boolean,
  visible?: boolean,
  index: number,
};

export const ViewerSlide = memo((
  {
    parentSize,
    slide,
    active,
  }: ViewerSlideProps,
) => {
  const {
    scale,
    visiblePagesPerSlide,
    changeScale,
  } = useViewerContext(
    ({state, actions}) => ({
      scale: active ? state.scale : 1,
      visiblePagesPerSlide: state.visiblePagesPerSlide,
      changeScale: actions.changeScale,
    }),
  );

  const {
    props: zoomProps,
    zoomed,
  } = useZoom(
    {
      scale,
      disabled: true, // fixme
      onChangeScale: (newScale: number) => changeScale(newScale),
    },
  );

  const {
    size: slideSize,
    style: pageStyle,
  } = useMemo(
    () => {
      const size = getOptimalPagesSize(
        filterImagePages(slide).map((item) => pick(['ratio'], item.image.preview)),
        parentSize,
      );

      // if provided 1 slide but mode is 2, expand it
      size.w *= visiblePagesPerSlide / slide.length;

      return {
        size,
        style: {
          width: `${(1 / slide.length) * 100}%`,
        },
      };
    },
    [
      slide,
      parentSize,
      visiblePagesPerSlide,
      slide.length,
    ],
  );

  return (
    <div
      className='c-viewer-slider__slide-inner'
      style={{
        width: `${slideSize.w * slide.length}px`,
        height: `${slideSize.h}px`,
      }}
      onMouseDown={
        zoomed
          ? stopPropagation
          : null
      }
    >
      <div {...zoomProps as any}>
        {slide.map(
          (page) => (
            <ViewerPage
              key={page.id}
              page={page}
              style={pageStyle}
            />
          ),
        )}
      </div>
    </div>
  );
});

ViewerSlide.displayName = 'ViewerSlide';
