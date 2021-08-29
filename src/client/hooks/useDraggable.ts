import {useRef, useEffect} from 'react';
import {is} from 'ramda';

import {fastClamp} from '@shared/helpers/fastClamp';
import {
  setNodeTranslate,
  getComputedTranslate,
} from '@client/helpers/html';

import {Vector} from '@shared/helpers/types/Vector';
import {Axis} from '@shared/types';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';
import {useGesture} from './useGesture';
import {useID} from './useID';
import {DragGestureHandlerState} from './useGesture/gestures/DragGesture';

let GLOBAL_DRAGGABLE_LOCK: string = null;

export type DraggableConfig = {
  dragMinDistance?: number,

  cursor?: string,
  lock?: boolean,
  clamp?: Vector,

  onDrag?(dragState?: DragGestureHandlerState, totalDrag?: Vector): void,
  onDragStart?(dragState?: DragGestureHandlerState, totalDrag?: Vector): void,
  onDragEnd?(dragState?: DragGestureHandlerState, totalDrag?: Vector): void,
};

export type DraggableInterceptor = {
  onDrag?(dragState?: DragGestureHandlerState): boolean,
  onDragStart?(dragState?: DragGestureHandlerState): boolean,
  onDragEnd?(dragState?: DragGestureHandlerState): boolean,
};

export function useDraggable(
  {
    // styles
    cursor = '-webkit-grab',

    // disable dragging
    lock,

    // locks
    clamp = new Vector,
    dragMinDistance,

    // watchers
    onDrag,
    onDragStart,
    onDragEnd,
  }: DraggableConfig = {},
) {
  const id = useID();
  const totalDrag = useRef<Vector>(null);
  const interceptorRef = useRef<DraggableInterceptor>(null);
  const elementRef = useRef<HTMLElement>(null);
  const globalLockResetTimer = useRef<number>(null);

  const getContainerTranslate = () => getComputedTranslate(elementRef.current);

  if (!totalDrag.current)
    totalDrag.current = new Vector;

  /**
   * Global locks are introduced due to nesting draggable
   * Slider contains draggable area with nested draggable items,
   * global lock is the simplest way to prevent parent to dragging
   * when child is dragging
   *
   * @see
   *  onMouseDown event must not be supressed due to onClick so do
   *  not use stopPropagation()
   *
   * @returns {boolean}
   */
  function isDragGlobalMutexLock(): boolean {
    return GLOBAL_DRAGGABLE_LOCK && GLOBAL_DRAGGABLE_LOCK !== id;
  }

  function lockGlobalMutexValue(): void {
    if (globalLockResetTimer.current !== null)
      clearTimeout(globalLockResetTimer.current);

    GLOBAL_DRAGGABLE_LOCK = id;
  }

  function unlockGlobalMutexValue() {
    if (globalLockResetTimer.current !== null)
      clearTimeout(globalLockResetTimer.current);

    globalLockResetTimer.current = <any> setTimeout(
      () => {
        if (GLOBAL_DRAGGABLE_LOCK === id)
          GLOBAL_DRAGGABLE_LOCK = null;
      },
      100,
    );
  }

  /**
   * Set container translate on both axis or single axis
   *
   * @param {(number|Vector)} vector
   * @param {Axis} [axis='x']
   */
  function setContainerTranslate(vector: number | Vector, axis: Axis = 'x'): void {
    if (axis) {
      const prevVector = vector ?? new Vector;

      vector = (
        totalDrag.current
          ? totalDrag.current.clone()
          : new Vector
      );

      (<any> vector)[axis] = is(Number, prevVector) ? prevVector : prevVector[axis];
    }

    setNodeTranslate(<Vector> vector, elementRef.current);
    totalDrag.current = <Vector> vector;
  }

  /**
   * Handles cursor change, resets totalDrag
   *
   * @param {DragGestureHandlerState} dragState
   * @returns {void}
   */
  function onDragStartHandler(dragState: DragGestureHandlerState): void {
    if (lock || isDragGlobalMutexLock() || interceptorRef.current?.onDragStart?.(dragState))
      return;

    if (cursor)
      document.body.style.cursor = cursor;

    totalDrag.current = getContainerTranslate();
    lockGlobalMutexValue();

    if (!dragMinDistance)
      setContainerTranslate(totalDrag.current);

    if (onDragStart)
      onDragStart(dragState, totalDrag.current);
  }

  /**
   * Watch drag move
   *
   * @param {DragGestureHandlerState} dragState
   * @returns {void}
   */
  function onDragHandler(dragState: DragGestureHandlerState): void {
    if (lock || isDragGlobalMutexLock() || interceptorRef.current?.onDrag?.(dragState))
      return;

    const {delta, distance} = dragState;
    const {current: vector} = totalDrag;

    const {
      x: xClamp,
      y: yClamp,
    } = clamp;

    if (xClamp !== null) {
      if (xClamp)
        vector.x = fastClamp(xClamp[0], xClamp[1], vector.x + delta.x);
      else
        vector.x += delta.x;
    }

    if (yClamp !== null) {
      if (yClamp)
        vector.y = fastClamp(yClamp[0], yClamp[1], vector.y + delta.y);
      else
        vector.y += delta.y;
    }

    if (!dragMinDistance || distance > dragMinDistance)
      setContainerTranslate(vector);

    if (onDrag)
      onDrag(dragState, totalDrag.current);
  }

  /**
   * Watch drag end
   *
   * @param {DragGestureHandlerState} dragState
   * @returns {void}
   */
  function onDragEndHandler(dragState: DragGestureHandlerState): void {
    if (isDragGlobalMutexLock() || interceptorRef.current?.onDragEnd?.(dragState))
      return;

    unlockGlobalMutexValue();
    if (lock)
      return;

    document.body.style.cursor = null;
    if (onDragEnd)
      onDragEnd(dragState, totalDrag.current);
  }

  const setInterceptor = (interceptor: DraggableInterceptor) => {
    interceptorRef.current = interceptor;
  };

  const getInterceptor = () => interceptorRef.current;

  const bindDragListeners = useGesture(
    !lock && {
      onDragStart: onDragStartHandler,
      onDrag: onDragHandler,
      onDragEnd: onDragEndHandler,
    },
  );

  useIsomorphicLayoutEffect(
    () => {
      const {current: node} = elementRef;
      if (!node)
        return;

      setContainerTranslate(totalDrag.current);
      node.style.touchAction = 'manipulation';
    },
  );

  useEffect(
    () => () => {
      if (GLOBAL_DRAGGABLE_LOCK === id)
        GLOBAL_DRAGGABLE_LOCK = null;
    },
    [lock],
  );

  return {
    getTotalDrag(): Vector {
      return totalDrag.current;
    },

    totalDragRef: totalDrag,
    elementRef,
    getContainerTranslate,
    setContainerTranslate,

    setInterceptor,
    getInterceptor,

    lockGlobalMutexValue,
    unlockGlobalMutexValue,
    isDragGlobalMutexLock,

    props: {
      ref: elementRef,
      ...bindDragListeners(),
    },
  };
}
