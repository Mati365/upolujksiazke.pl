import {assignListenersChain} from '@client/helpers/html/assignListenersChain';

import {DragGesture} from './gestures/DragGesture';
import {PinchGesture} from './gestures/PinchGesture';
import {GestureHandlerState} from './GestureHandler';

export type GestureStateListener = (newState: any, state: any) => void;

export type WrappedHTMLListeners = object;

export type GestureListeners = {
  [name: string]: GestureStateListener,
};

export type GestureContextState = {
  [key: string]: GestureHandlerState,
};

/**
 * Handles all gestures state and calls update fn
 */
export class GestureStateContext {
  public state: GestureContextState = {};

  protected elementHTMLListeners: WrappedHTMLListeners = [];
  protected listeners: GestureListeners;

  constructor(
    {
      listeners = {},
      state = {},
    }: {
      listeners?: GestureListeners,
      state?: GestureContextState,
    } = {},
  ) {
    this.state = state;
    this.listeners = listeners;
  }

  /**
   * Set state one of multiple gestures
   *
   * @param {GestureHandlerState} newState
   * @param {string} gestureKey
   * @param {string} listenerKey
   * @memberof GestureStateContext
   */
  setState(newState: GestureHandlerState, gestureKey: string, listenerKey: string): void {
    const handlerListener = listenerKey && this.listeners[listenerKey];

    this.state[gestureKey] = newState;
    handlerListener?.(newState, this.state); // eslint-disable-line no-unused-expressions
  }

  /**
   * Appends gesture handler
   *
   * @param {*} HandlerClass
   * @memberof GestureStateContext
   */
  appendGestureHandler(HandlerClass: any): void {
    const {elementHTMLListeners} = this;
    const {htmlListeners} = new HandlerClass(this);

    assignListenersChain(
      htmlListeners,
      elementHTMLListeners,
    );
  }

  /**
   * Wraps listeners from constructor, returns chained methods
   *
   * @returns {WrappedHTMLListeners}
   * @memberof GestureStateContext
   */
  bind = (listeners: GestureListeners): WrappedHTMLListeners => {
    this.elementHTMLListeners = {};
    this.listeners = listeners ?? {};

    if (listeners) {
      if ('onDrag' in listeners)
        this.appendGestureHandler(DragGesture);

      if ('onPinch' in listeners)
        this.appendGestureHandler(PinchGesture);
    }

    return this.elementHTMLListeners;
  };
}
