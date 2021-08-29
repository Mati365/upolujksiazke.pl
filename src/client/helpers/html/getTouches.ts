import {map} from 'ramda';
import {Vector} from '@shared/helpers/types/Vector';
import {getPointerCoordinates} from './getPointerCoordinates';

export function getTouches(e: TouchEvent): Vector[] {
  const {touches} = e;
  if (!touches)
    return [getPointerCoordinates(e as any)];

  return map(
    (touch: Touch) => new Vector(
      touch.clientX,
      touch.clientY,
    ),
    touches,
  );
}
