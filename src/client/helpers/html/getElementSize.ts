import {Rectangle} from '@shared/types';
import {Vector} from '@shared/helpers/types/Vector';

/**
 * Returns computer total x / y border size
 *
 * @export
 * @param {Element} element
 * @returns {Vector}
 */
export function getElementBorder(element: Element): Vector {
  const computed = window.getComputedStyle(element);

  return new Vector(
    Number.parseInt(computed.borderLeftWidth, 10) + Number.parseInt(computed.borderRightWidth, 10),
    Number.parseInt(computed.borderTopWidth, 10) + Number.parseInt(computed.borderBottomWidth, 10),
  );
}

/**
 * Returns computer total x / y margin size
 *
 * @export
 * @param {Element} element
 * @returns {Vector}
 */
export function getElementMargins(element: Element): Vector {
  const computed = window.getComputedStyle(element);

  return new Vector(
    Number.parseInt(computed.marginLeft, 10) + Number.parseInt(computed.marginRight, 10),
    Number.parseInt(computed.marginTop, 10) + Number.parseInt(computed.marginBottom, 10),
  );
}

/**
 * Returns size of component based on getBoundingClientRect
 *
 * @export
 * @param {Element} element
 * @param {boolean} [includeScroll=true]
 * @param {boolean} [includeBorders=false]
 * @returns {Rectangle}
 */
export function getElementSize(
  element: Element,
  includeScroll: boolean = true,
  includeBorders: boolean = false,
): Rectangle {
  const rect = element.getBoundingClientRect();
  let borderW = 0;
  let borderH = 0;

  if (includeBorders) {
    const border = getElementBorder(element);

    borderW += border.x;
    borderH += border.y;
  }

  return {
    x: rect.left + (includeScroll ? window.scrollX : 0),
    y: rect.top + (includeScroll ? window.scrollY : 0),
    w: rect.width + borderW,
    h: rect.height + borderH,
  };
}
