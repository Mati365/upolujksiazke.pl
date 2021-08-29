import {isSSR} from '@shared/helpers/isSSR';

const TOUCH_DEVICE = !isSSR() && !!('ontouchstart' in window || (navigator as any).msMaxTouchPoints);

export function isTouchDevice(): boolean {
  return TOUCH_DEVICE;
}
