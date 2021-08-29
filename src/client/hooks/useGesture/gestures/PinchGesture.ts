import React from 'react';

import {mountElementEvents} from '@client/helpers/html/mountElementEvents';
import {suppressEvent, getTouches} from '@client/helpers/html';

import {Vector} from '@shared/helpers/types/Vector';
import {GestureStateContext} from '../GestureStateContext';
import {GestureHandler, GestureHandlerState} from '../GestureHandler';

export type PinchGestureHandlerState = GestureHandlerState & {
  pinching: boolean,
  distance: number,
  delta: number,
  center: Vector,
};

export enum PinchAction {
  PINCH_START = 'onPinchStart',
  PINCH_CHANGE = 'onPinch',
  PINCH_END = 'onPinchEnd',
}

export class PreventDefaultPinchZoom extends React.Component {
  private dragListeners: VoidFunction = null;

  componentDidMount() {
    this.dragListeners = mountElementEvents(
      {
        passive: false,
        capture: true,
      },
      [
        ['gesturestart', suppressEvent],
        ['touchmove', this.onTouchMove],
      ],
      document,
    );
  }

  componentWillUnmount() {
    /* eslint-disable no-unused-expressions */
    this.dragListeners?.();
    /* eslint-enable no-unused-expressions */
  }

  onTouchMove = (e: any) => {
    if (('scale' in e) && e.scale !== 1)
      e.preventDefault();
  };

  render() {
    const {children} = this.props;

    return children;
  }
}

/**
 * Used in zoom
 *
 * @export
 * @class PinchGesture
 * @extends {GestureHandler<PinchGestureHandlerState>('pinch')}
 */
export class PinchGesture extends GestureHandler<PinchGestureHandlerState>('pinch') {
  public windowDragListeners: VoidFunction = null;

  constructor(controller: GestureStateContext) {
    super(controller);
    this.htmlListeners = [
      ['onTouchStart', this.onStart.bind(this)],
    ];
  }

  abortPinch(): void {
    const {gestureState: gState} = this;

    gState.pinching = false;
    if (this.windowDragListeners) {
      this.windowDragListeners();
      this.windowDragListeners = null;
    }
  }

  onStart(e: TouchEvent): void {
    const {gestureState: gState} = this;
    if (gState.pinching)
      return;

    const touches = getTouches(e);
    if (touches.length !== 2)
      return;

    suppressEvent(e);
    this.setGestureState(
      {
        pinching: true,
        distance: Vector.sumDistances(touches),
        delta: 0,
        center: null,
      },
      PinchAction.PINCH_START,
    );

    this.windowDragListeners = mountElementEvents(
      {
        passive: false,
        capture: true,
      },
      [
        ['touchmove', this.onChange.bind(this)],
        ['touchend', this.onEnd.bind(this)],
      ],
      window,
    );
  }

  onChange(e: TouchEvent): void {
    const {gestureState: gState} = this;
    if (!gState.pinching)
      return;

    const touches = getTouches(e);
    suppressEvent(e);

    if (touches.length <= 1) {
      this.abortPinch();
      return;
    }

    const distance = Vector.sumDistances(touches);

    gState.delta = distance / gState.distance;
    gState.distance = distance;
    gState.center = Vector.lerp(touches[0], touches[1], 0.5);

    this.setGestureState(
      gState,
      PinchAction.PINCH_CHANGE,
    );
  }

  onEnd(e: TouchEvent) {
    const {gestureState: gState} = this;
    if (!gState.pinching)
      return;

    this.onChange(e);
    this.abortPinch();

    this.setGestureState(
      gState,
      PinchAction.PINCH_END,
    );
  }
}
