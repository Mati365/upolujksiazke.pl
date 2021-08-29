import {findIndex} from 'ramda';
import {findMap} from '@shared/helpers';

import {ViewerState} from './initialState';
import {ViewerSelectors} from './selectors';

const changeSlide = (active: number) => (state: ViewerState): ViewerState => {
  if (state.active === active)
    return state;

  return {
    ...state,
    scale: 1,
    active,
  };
};

const changeSlideByPageIndex = (page: number) => (state: ViewerState, selectors: ViewerSelectors): ViewerState => {
  const found = findMap(
    (pages, index) => {
      const sideIndex = findIndex(
        (_page) => _page && _page.index === page,
        pages,
      );

      return {
        found: sideIndex !== -1,
        value: {
          slideIndex: index,
          sideIndex,
        },
      };
    },
    selectors.getSlides(),
  );

  if (!found)
    return state;

  return changeSlide(found.slideIndex)(state);
};

const changeScale = (scale: number) => (state: ViewerState) => ({
  ...state,
  scale,
});

export const ViewerActions = {
  changeScale,
  changeSlide,
  changeSlideByPageIndex,
};
