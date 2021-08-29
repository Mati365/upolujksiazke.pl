import {isTouchDevice} from '@client/helpers/html';

import {Size} from '@shared/types';
import {ViewerSizingMode} from '../context/utils/initialState';

export const SCREEN_BREAKPOINTS = {
  MOBILE: 500,
  TABLET: 900,
};

/**
 * Get value used to calculate viewer mode
 *
 * @export
 * @param {Size} frameSize
 * @returns {ViewerSizingMode}
 */
export function getViewerFrameSizingMode(frameSize: Size): ViewerSizingMode {
  if (!frameSize)
    return null;

  const touchDevice = isTouchDevice();
  const mode: ViewerSizingMode = {
    portrait: frameSize.w < frameSize.h || frameSize.w <= SCREEN_BREAKPOINTS.MOBILE,
    mobile: false,
    tablet: false,
    desktop: false,
    touch: touchDevice,
    size: frameSize,
  };

  if (touchDevice && frameSize.w <= SCREEN_BREAKPOINTS.MOBILE)
    mode.mobile = true;
  else if (touchDevice && frameSize.w <= SCREEN_BREAKPOINTS.TABLET)
    mode.tablet = true;
  else
    mode.desktop = true;

  return mode;
}
