import {isNil} from 'ramda';

import {ListenersChain} from '@client/helpers/html/assignListenersChain';
import {GestureStateContext} from './GestureStateContext';

export type GestureHandlerState = {
  __meta?: {
    timeouts: {},
  },
};

/**
 * It implements proxy between HTML DOM elements events
 * and controller context state
 */
export function GestureHandler<S extends GestureHandlerState, A = any>(gestureKey: string) {
  return class {
    static gestureKey = gestureKey;
    public htmlListeners: ListenersChain;

    constructor(
      public readonly controller: GestureStateContext,
      public readonly args: A = null,
    ) {}

    get gestureState(): S {
      const {controller} = this;

      controller.state[gestureKey] = controller.state[gestureKey] || {
        __meta: {
          timeouts: {},
        },
      };
      return <S> controller.state[gestureKey];
    }

    get timeouts() {
      return this.gestureState.__meta.timeouts;
    }

    /**
     * Sets specified gesture state
     *
     * @param {S} newState
     * @param {string} listenerKey
     */
    setGestureState(newState: S, listenerKey: string): void {
      const {controller} = this;

      newState.__meta = this.gestureState.__meta;
      controller.setState(newState, gestureKey, listenerKey);
    }

    /**
     * Check if timeout is still available in unresolved timeouts list
     *
     * @param {string} key
     * @returns {boolean}
     */
    isTimeoutActive(key: string): boolean {
      return !isNil(this.timeouts[key]);
    }

    /**
     * Remove specified timeout from gesture state
     *
     * @param {string} key
     */
    clearTimeout(key: string): void {
      const timeout = this.timeouts[key];

      if (!isNil(timeout))
        clearTimeout(timeout);
    }

    /**
     * Registers specified timeout in gesutreState timeout
     *
     * @param {string} key
     * @param {VoidFunction} fn
     * @param {number} time
     */
    setTimeout(key: string, fn: VoidFunction, time: number): void {
      this.timeouts[key] = setTimeout(
        () => {
          delete this.timeouts[key];
          fn?.(); // eslint-disable-line no-unused-expressions
        },
        time,
      );
    }
  };
}
