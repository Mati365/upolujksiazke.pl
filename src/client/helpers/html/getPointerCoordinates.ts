import {Vector} from '@shared/helpers/types/Vector';

/**
 * Get current mouse position
 *
 * @export
 * @param {MouseEvent} e
 * @returns {Vector}
 */
export function getPointerCoordinates(e: MouseEvent): Vector {
  const changedTouches = (<any> e).changedTouches && (<any> e).changedTouches[0];
  if (changedTouches) {
    return new Vector(
      changedTouches.clientX,
      changedTouches.clientY,
    );
  }

  return new Vector(
    e.clientX,
    e.clientY,
  );
}
