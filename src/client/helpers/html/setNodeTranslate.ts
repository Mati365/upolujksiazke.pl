import {Vector} from '@shared/helpers/types/Vector';

/**
 * Sets translate3d of element
 *
 * @param {Vector} vector
 * @param {HTMLElement} node
 * @returns {HTMLElement}
 */
export function setNodeTranslate(vector: Vector, node: HTMLElement): HTMLElement {
  if (!node)
    return null;

  node.style.transform = (
    vector.x === 0 && vector.y === 0
      ? ''
      : `translate3d(${vector.x}px, ${vector.y}px, 0px)`
  );

  return node;
}
