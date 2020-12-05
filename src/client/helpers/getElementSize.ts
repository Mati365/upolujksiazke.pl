import {Size} from '@shared/types';

/**
 * Returns size of component based on getBoundingClientRect
 *
 * @export
 * @param {Element} element
 * @param {boolean} [includeScroll=true]
 * @returns {Size}
 */
export function getElementSize(
  element: Element,
  includeScroll: boolean = true,
): Size {
  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + (includeScroll ? window.scrollX : 0),
    y: rect.top + (includeScroll ? window.scrollY : 0),
    w: rect.width,
    h: rect.height,
  };
}
