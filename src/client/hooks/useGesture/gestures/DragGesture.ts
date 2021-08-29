import {
  suppressEvent,
  mountElementEvents,
  getPointerCoordinates,
  getTouches,
} from '@client/helpers/html';

import {Vector} from '@shared/helpers/types/Vector';
import {GestureStateContext} from '../GestureStateContext';
import {GestureHandler, GestureHandlerState} from '../GestureHandler';

export type DragGestureHandlerState = GestureHandlerState & {
  // drag start
  clickLock: boolean,
  dragging: boolean,
  timeStamp: number,
  startCoords: Vector,
  coords: Vector,

  // dragging
  delta?: Vector,
  velocity?: number,
  distance?: number,
  axisDistance?: Vector,
  direction?: Vector,
};

export enum DragAction {
  DRAG_START = 'onDragStart',
  DRAG_CHANGE = 'onDrag',
  DRAG_END = 'onDragEnd',
  CLICK_UNLOCK = 'onClickUnlock',
}

export class DragGesture extends GestureHandler<DragGestureHandlerState>('drag') {
  public windowDragListeners: VoidFunction = null;

  constructor(controller: GestureStateContext) {
    super(controller);
    this.htmlListeners = [
      [['onTouchStart', 'onMouseDownCapture'], this.onStart.bind(this)],
      ['onClickCapture', this.onClick.bind(this)],
    ];
  }

  abortDragging(silent?: boolean) {
    const {gestureState: gState} = this;
    if (!gState.dragging)
      return;

    gState.timeStamp = null;
    gState.delta = new Vector;
    gState.coords = gState.startCoords;
    gState.velocity = 0;
    gState.clickLock = false;

    if (this.windowDragListeners) {
      this.windowDragListeners();
      this.windowDragListeners = null;
    }

    if (!silent) {
      this.setGestureState(
        gState,
        DragAction.DRAG_END,
      );
    }
  }

  /**
   * Watch mouse down
   *
   * @param {(TouchEvent | MouseEvent)} e
   * @returns {void}
   * @memberof DragGesture
   */
  onStart(e: TouchEvent | MouseEvent): void {
    const {gestureState: gState} = this;
    if (gState.dragging)
      return;

    if (getTouches(<TouchEvent> e).length > 1)
      return;

    const coords = getPointerCoordinates(<MouseEvent> e);

    this.clearTimeout('clickLock');
    this.setGestureState(
      {
        clickLock: false,
        dragging: true,
        timeStamp: e.timeStamp,
        startCoords: coords,
        coords,
      },
      DragAction.DRAG_START,
    );

    this.windowDragListeners = mountElementEvents(
      {
        passive: false,
      },
      [
        [['mousemove', 'touchmove'], this.onChange.bind(this)],
        [['mouseup', 'touchend'], this.onEnd.bind(this)],
        ['click', () => this.abortDragging()],
      ],
      window,
    );
  }

  /**
   * Watch mouse move
   *
   * @param {(TouchEvent|MouseEvent)} e
   * @returns {void}
   * @memberof DragGesture
   */
  onChange(e: TouchEvent | MouseEvent): void {
    const {gestureState: gState} = this;
    if (!gState.dragging)
      return;

    if (getTouches(<TouchEvent> e).length > 1) {
      this.abortDragging();
      return;
    }

    const newCoords = getPointerCoordinates(<MouseEvent> e);
    const {coords: prevCoords} = gState;

    const delta = Vector.sub(newCoords, prevCoords);
    const deltaTime = e.timeStamp - gState.timeStamp;

    gState.timeStamp = e.timeStamp;
    gState.delta = delta;
    gState.coords = newCoords;
    gState.velocity = Vector.len(delta) / deltaTime;

    gState.distance = Vector.distance(gState.startCoords, newCoords);
    gState.axisDistance = new Vector(
      Math.abs(gState.startCoords.x - newCoords.x),
      Math.abs(gState.startCoords.y - newCoords.y),
    );

    if (gState.distance >= 5)
      gState.clickLock = true;

    this.setGestureState(
      gState,
      DragAction.DRAG_CHANGE,
    );
  }

  /**
   * Watch mouse up
   *
   * @param {MouseEvent} e
   * @returns
   * @memberof DragGesture
   */
  onEnd(e: TouchEvent | MouseEvent) {
    const {gestureState: gState} = this;
    if (!gState.dragging)
      return;

    if (getTouches(<TouchEvent> e).length > 1) {
      this.abortDragging();
      return;
    }

    this.onChange(e);

    gState.dragging = false;
    gState.direction = Vector.sub(gState.startCoords, gState.coords);
    gState.direction.x /= gState.distance;
    gState.direction.y /= gState.distance;

    if (this.windowDragListeners) {
      this.windowDragListeners();
      this.windowDragListeners = null;
    }

    this.setGestureState(
      gState,
      DragAction.DRAG_END,
    );

    if (gState.clickLock) {
      this.setTimeout(
        'clickLock',
        () => {
          this.setGestureState(
            {
              ...this.gestureState,
              clickLock: false,
            },
            DragAction.CLICK_UNLOCK,
          );
        },
        350,
      );
    }
  }

  /**
   * Watches click
   *
   * @param {MouseEvent} e
   * @memberof DragGesture
   */
  onClick(e: MouseEvent): void {
    if (this.gestureState?.clickLock)
      suppressEvent(e);
  }
}
