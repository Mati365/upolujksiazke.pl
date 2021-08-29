import {Overwrite, Size} from '@shared/types';
import {BrochureRecord, BrochurePageRecord} from '@api/types';

export type BrochurePagesChunk = BrochurePageRecord[];

export type ViewerSizingMode = {
  size?: Size,
  portrait: boolean,
  mobile: boolean,
  tablet: boolean,
  desktop: boolean,
  touch?: boolean,
};

export type ViewerState = {
  brochure: BrochureRecord,
  active: number,
  scale: number,
  containerSize?: Size,
  visiblePagesPerSlide?: number,
  sizingMode?: ViewerSizingMode,
};

export type ViewerStateInitializer = Overwrite<Partial<ViewerState>, {
  brochure: BrochureRecord,
}>;

/**
 * Create blank viewer state
 *
 * @export
 * @param {ViewerStateInitializer} state
 * @return {ViewerState}
 */
export function createInitialViewerState(state: ViewerStateInitializer): ViewerState {
  return {
    brochure: null,
    active: 0,
    scale: 1,
    ...state,
  };
}
