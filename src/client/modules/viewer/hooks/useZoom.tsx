/* eslint-disable @typescript-eslint/no-use-before-define, no-use-before-define */
import {useState, useEffect, useRef} from 'react';
import {isNil, any} from 'ramda';

import {fastClamp} from '@shared/helpers';
import {
  getPointerCoordinates,
  getElementSize,
  getComputedTranslate,
  mountElementEvents,
  suppressEvent,
} from '@client/helpers/html';

import {
  usePrevious,
  useDraggable,
  useGesture,
} from '@client/hooks';

import {Rectangle} from '@shared/types';
import {Vector} from '@shared/helpers/types/Vector';
import {PinchGestureHandlerState} from '@client/hooks/useGesture/gestures/PinchGesture';

export const DEFAULT_MAX_SCALE = 4;

type ZoomConfig = {
  unzoomAnimDuration?: number,
  disabled?: boolean,
  allowDblClickZoom?: boolean,
  max?: number,
  scale?: number,
  onChangeScale?(scale?: number): void,
};

type ZoomState = {
  originalSize?: Rectangle,
  scale?: number,
  origin?: Vector,
  prevRelParentPos?: Vector,
};

/**
 * @see {@link https://github.com/worka/vanilla-js-wheel-zoom/blob/master/src/wheel-zoom.js}
 *
 * @export
 * @param {ZoomConfig} [config={
 *     min: 1,
 *     max: 4,
 *   }]
 * @returns
 */
export function useZoom(
  {
    scale: controlledScale,
    unzoomAnimDuration = 250,
    disabled = false,
    allowDblClickZoom = true,
    max = DEFAULT_MAX_SCALE,
    onChangeScale,
  }: ZoomConfig = {},
) {
  const [activeTransition, setActiveTransition] = useState<number>(null);
  const [state, setState] = useState<ZoomState>(
    () => ({
      scale: 1,
      origin: new Vector,
    }),
  );

  const transitionActive = !isNil(activeTransition);
  const zoomed = isZoomed();
  const {
    props: draggableProps,
    elementRef,
    totalDragRef,
    setContainerTranslate,
  } = useDraggable(
    {
      lock: !zoomed,
      dragMinDistance: 20,
    },
  );

  const pinchProps = useGesture(
    !disabled && {
      onPinch({center, delta}: PinchGestureHandlerState) {
        if (!center || disabled)
          return;

        zoomMouseRegion(
          1.0 + delta / 10,
          delta < 1,
          center,
        );
      },
    },
  )();

  const prevControlledScale = usePrevious(controlledScale);
  if (disabled) {
    if (zoomed)
      resetZoom(true);
  } else if (elementRef.current && !isNil(controlledScale) && prevControlledScale !== controlledScale)
    setZoom(controlledScale);

  useEffect(
    () => {
      if (!elementRef.current)
        return;

      state.originalSize = getElementSize(elementRef.current.parentElement);
    },
    [elementRef.current],
  );

  function isZoomed() {
    return state.scale > 1.02 || transitionActive;
  }

  /**
   * Reset zoom viewport to initial state
   *
   * @param {boolean} [silent=false]
   */
  function resetZoom(silent: boolean = false): void {
    if (state.scale === 1 && !state.prevRelParentPos)
      return;

    state.scale = 1;
    state.prevRelParentPos = null;
    state.origin.x = 0;
    state.origin.y = 0;

    // trigger rerender
    if (!silent) {
      setActiveTransition(
        setTimeout(
          () => {
            setActiveTransition(null);
          },
          unzoomAnimDuration,
        ) as any,
      );

      // eslint-disable-next-line no-unused-expressions
      onChangeScale?.(state.scale);
    }
  }

  /**
   * Centers regions
   *
   * @see {@link https://stackoverflow.com/a/29971689}
   *
   * @param {number} newScale
   * @param {boolean} silent
   * @param {Vector} [centerPos=state.prevRelParentPos]
   */
  function setZoom(
    newScale: number,
    silent: boolean = true,
    centerPos: Vector = state.prevRelParentPos,
  ): void {
    if (state.scale === 1.0)
      state.originalSize = getElementSize(elementRef.current.parentElement);

    let delta = Math.abs(newScale / state.scale);
    const scale = state.scale * delta;
    const clampedScale = fastClamp(1, max, scale);

    if (!centerPos) {
      const size = getElementSize(elementRef.current);
      centerPos = new Vector(
        size.w / 2,
        size.h / 2,
      );
    }

    delta *= clampedScale / scale;
    state.scale = clampedScale;

    if (state.scale <= 1)
      resetZoom(silent);
    else {
      state.origin.x -= (centerPos.x - state.origin.x) * (delta - 1);
      state.origin.y -= (centerPos.y - state.origin.y) * (delta - 1);
      state.prevRelParentPos = centerPos;

      if (!silent) {
        setState(
          {
            ...state,
          },
        );

        // eslint-disable-next-line no-unused-expressions
        onChangeScale?.(state.scale);
      }
    }

    if (silent && isZoomed() !== zoomed)
      setState({...state});
  }

  /**
   * Zooms certain area
   *
   * @param {Vector} relParentPos
   * @param {number} delta
   * @param {boolean} out
   */
  function zoom(relParentPos: Vector, delta: number, out: boolean): void {
    if (transitionActive)
      return;

    if (out)
      delta = 1 / delta;

    setZoom(state.scale * delta, false, relParentPos);
  }

  /**
   * Zooms region pointed by mouse event
   *
   * @param {number} delta
   * @param {boolean} out
   * @param {MouseEvent} e
   * @returns {void}
   */
  function zoomMouseRegion(delta: number, out: boolean, e: MouseEvent | Vector): void {
    const {current: node} = elementRef;
    if (disabled || !node || !state.originalSize || transitionActive)
      return;

    const pos = e instanceof Vector ? e : getPointerCoordinates(e);
    const parentSize = getElementSize(node.parentElement);

    // user can move img using draggable
    state.origin = getComputedTranslate(node) ?? state.origin;
    zoom(
      new Vector(
        pos.x - parentSize.x + window.scrollX,
        pos.y - parentSize.y + window.scrollY,
      ),
      delta,
      out,
    );
  }

  /**
   * Handle mouse wheel event and normalize position
   * relative to zoomed body
   *
   * @param {WheelEvent} e
   * @returns {void}
   */
  function onWheel(e: WheelEvent): void {
    if (disabled)
      return;

    const lockAreas = Array.from((e.currentTarget as HTMLElement).querySelectorAll('.cv-lock-scroll'));
    const zoomOut = Math.sign(e.deltaY) === 1;

    if ((!zoomOut || state.scale < 1.01) && any(
      (area) => area === e.target || area.contains(e.target as any),
      lockAreas,
    ))
      return;

    suppressEvent(e);
    zoomMouseRegion(
      1.2,
      zoomOut,
      e,
    );
  }

  /**
   * Zoom on double click
   *
   * @param {MouseEvent} e
   * @returns {void}
   */
  function onDoubleClick(e: MouseEvent): void {
    if (!allowDblClickZoom)
      return;

    if (zoomed)
      resetZoom();
    else {
      zoomMouseRegion(
        (max + 1) / 2,
        false,
        e,
      );
    }
  }

  totalDragRef.current = state.origin;

  if (!disabled)
    setContainerTranslate(state.origin);

  // h4ck for chrome, must have passive: false event
  const wheelRef = useRef<typeof onWheel>();
  wheelRef.current = onWheel;

  useEffect(
    () => mountElementEvents(
      {
        passive: false,
      },
      [
        ['wheel', (e: WheelEvent) => wheelRef.current(e)],
      ],
      elementRef.current,
    ),
    [elementRef.current],
  );

  return {
    props: {
      ...draggableProps,
      ...pinchProps,

      style: {
        display: 'inherit',
        width: 'inherit',
        height: 'inherit',
        ...activeTransition && {
          transition: `${unzoomAnimDuration}ms cubic-bezier(.62,.28,.23,.99)`,
          transitionProperty: 'transform, width, height',
        },
        ...state.originalSize && (activeTransition || zoomed) && {
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${state.scale * state.originalSize.w}px`,
          height: `${state.scale * state.originalSize.h}px`,

          ...(state.origin.x || state.origin.y) && {
            transform: `translate3d(${state.origin.x}px, ${state.origin.y}px, 0)`,
          },
        },
      },

      onDoubleClick,
      onTouchStart(...args: any[]) {
        /* eslint-disable no-unused-expressions */
        (draggableProps as any).onTouchStart?.(...args);
        (pinchProps as any).onTouchStart?.(...args);
        /* eslint-enable no-unused-expressions */
      },
    },
    zoomed,
    resetZoom,
    ...state,
  };
}
