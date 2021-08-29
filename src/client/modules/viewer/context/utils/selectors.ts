import {map} from 'ramda';

import {cacheOneCall} from '@shared/helpers/memoizeOne';

import {ID} from '@shared/types';
import {BrochurePageRecord} from '@api/types';
import {StateAccessor} from '@client/modules/context';
import {ViewerState, BrochurePagesChunk} from './initialState';
import {
  filterImagePages,
  isImagePage,
  splitPagesToChunks,
} from '../../helpers';

function sizingModeCacheFn([prevState]: [ViewerState], [state]: [ViewerState]): boolean {
  return !prevState || prevState.sizingMode !== state.sizingMode;
}

function brochureCacheKey(state: ViewerState): ID {
  const {brochure} = state;

  return brochure.id;
}

function brochureCacheFn([prevState]: [ViewerState], [state]: [ViewerState]): boolean {
  return (
    !prevState
      || brochureCacheKey(prevState) !== brochureCacheKey(state)
      || sizingModeCacheFn([prevState], [state])
  );
}

export function createViewerSelectors(ctx: StateAccessor<ViewerState>) {
  /**
   * Returns true if component receives mode
   *
   * @returns {boolean}
   */
  function isMeasured(): boolean {
    return ctx.getState().sizingMode !== null;
  }

  /**
   * Returns true if scale is bigger than min val
   *
   * @returns {boolean}
   */
  function isZoomed(): boolean {
    return ctx.getState().scale >= 1.1;
  }

  /**
   * Return brochure pages with corrected indexes
   *
   * @returns {BrochurePageRecord[]}
   */
  const getModeLeafletPagesList = cacheOneCall(brochureCacheFn)(
    (state): BrochurePageRecord[] => {
      const {
        brochure: {
          pages,
        },
      } = state;

      let indexAcc = 0;
      const indexedPages = map(
        (page) => {
          const newPage: BrochurePageRecord = {
            ...page,
            index: indexAcc,
          };

          if (isImagePage(newPage))
            indexAcc++;

          return newPage;
        },
        pages,
      );

      return indexedPages;
    },
  );

  /**
   * Returns image pages only, do not include INSERT etc
   *
   * @returns {number}
   */
  const getTotalImagePages = cacheOneCall(brochureCacheFn)(
    (state: ViewerState): number => (
      filterImagePages(
        getModeLeafletPagesList(state),
      ).length
    ),
  );

  /**
   * Returns chunks of brochure pages.
   * Each chunk is size of visiblePagesPerSlide
   *
   * @returns {BrochurePagesChunk[]}
   */
  const getSlidesNonCached = (state: ViewerState): BrochurePagesChunk[] => {
    const {visiblePagesPerSlide} = state;
    const modePages = getModeLeafletPagesList(state);

    return splitPagesToChunks(visiblePagesPerSlide, modePages);
  };

  /**
   * Returns all pages chunks
   *
   * @returns {BrochurePagesChunk[]}
   */
  const getSlides = cacheOneCall(brochureCacheFn)(
    (state: ViewerState) => getSlidesNonCached(state),
  );

  /**
   * Returns thumbnails that are always in 2 mode
   * @returns {BrochurePagesChunk[]}
   */
  const getThumbnails = cacheOneCall(brochureCacheFn)(
    (state: ViewerState): BrochurePagesChunk[] => (
      splitPagesToChunks(
        2,
        filterImagePages(
          getModeLeafletPagesList(state),
        ),
      )
    ),
  );

  /**
   * Get current viewer slide
   *
   * @param {ViewerState} state
   * @return {BrochurePageRecord[]}
   */
  const getVisiblePages = (state: ViewerState): BrochurePageRecord[] => (
    getSlides(state)[state.active]
  );

  return {
    getSlides() { return getSlides(ctx.getState()); },
    getTotalImagePages() { return getTotalImagePages(ctx.getState()); },
    getVisiblePages() { return getVisiblePages(ctx.getState()); },
    getThumbnails() { return getThumbnails(ctx.getState()); },
    isMeasured,
    isZoomed,
  };
}

export type ViewerSelectors = ReturnType<typeof createViewerSelectors>;
