import {Vector} from '@shared/helpers/types/Vector';

/**
 * Picks X/Y translate from element, useful in transition
 * state checking when user starts dragging when transition still occurs
 *
 * @export
 * @param {HTMLElement} element
 * @returns {Vector}
 */
export function getComputedTranslate(element: HTMLElement): Vector {
  const {transform} = getComputedStyle(element);
  let mat = transform.match(/^matrix3d\((.+)\)$/);
  if (mat) {
    const split = mat[1].split(', ');

    return new Vector(
      parseFloat(split[13]),
      parseFloat(split[14]),
    );
  }

  mat = transform.match(/^matrix\((.+)\)$/);

  if (mat) {
    const split = mat[1].split(', ');

    return new Vector(
      parseFloat(split[4]),
      parseFloat(split[5]),
    );
  }

  return new Vector(0, 0);
}
