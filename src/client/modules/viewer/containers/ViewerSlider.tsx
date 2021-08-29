import React, {forwardRef} from 'react';

import {Size} from '@shared/types';
import {
  Slider,
  SliderRef,
} from '@client/modules/slider';

import {getFirstNonNullPage} from '../helpers';
import {useViewerContext} from '../context/viewerContext';

import {ViewerSlide} from './ViewerSlide';
import {ViewerDoubledNavArrow} from './ViewerNavArrow';

const DEFAULT_SLIDER_CLASSES = {
  container: 'expanded',
};

export type ViewerSliderProps = {
  size: Size,
};

export const ViewerSlider = forwardRef<SliderRef, ViewerSliderProps>(({size}, ref) => {
  const {
    zoomed,
    active,
    changeSlide,
    slides,
  } = useViewerContext(
    ({state, actions, selectors}) => ({
      visiblePagesPerSlide: state.visiblePagesPerSlide,
      changeSlide: actions.changeSlide,
      active: state.active,
      zoomed: selectors.isZoomed(),
      slides: selectors.getSlides(),
    }),
  );

  return (
    <Slider
      ref={ref}
      classNames={DEFAULT_SLIDER_CLASSES}
      slideWidth={size.w}
      slideTime={slides[0].length * 100}
      active={active}
      lock={zoomed}
      provideSlideStateProps
      style={{
        width: size.w,
      }}
      controlled
      showNav
      navComponent={ViewerDoubledNavArrow}
      onActiveChange={({newActive}) => {
        changeSlide(newActive);
      }}
    >
      {slides.map(
        (slide, index) => {
          const firstNonNullPage = getFirstNonNullPage(slide);

          return (
            <ViewerSlide
              key={firstNonNullPage.id}
              index={index}
              slide={slide}
              parentSize={size}
            />
          );
        },
      )}
    </Slider>
  );
});

ViewerSlider.displayName = 'ViewerSlider';
