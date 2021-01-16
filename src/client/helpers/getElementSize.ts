import {Rect} from '@shared/types';

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
): Rect {
  const rect = element.getBoundingClientRect();

  return new Rect(
    rect.left + (includeScroll ? window.scrollX : 0),
    rect.top + (includeScroll ? window.scrollY : 0),
    rect.width,
    rect.height,
  );
}
