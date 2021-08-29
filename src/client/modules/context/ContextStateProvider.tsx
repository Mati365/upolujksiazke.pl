import React, {ReactNode, ComponentType} from 'react';
import {
  is, isNil, forEach,
  always, mapObjIndexed, without,
} from 'ramda';

import {shallowCompareArrays} from '@shared/helpers/shallowCompareArrays';
import {MemoizeMethod} from '@shared/helpers/decorators/MemoizeMethod';
import {isSSR} from '@shared/helpers/isSSR';
import {
  StateContext,
  ComputedState,
} from './hooks/useSubscribedStateContext';

export type StateAccessor<S> = {getState(): S};

export type ContextSelectorsFactory<S, SS> = (accessor?: StateAccessor<S>) => SS;

export type ContextAction<R = any> = (...args: R[] | [R]) => any;

export type ContextStateRenderChildren<S> = (state: S) => ReactNode;

export type ContextStateProviderProps<S, A, SS> = {
  contextComponent: ComponentType<{
    value: StateContext<S, A, SS>,
  }>,

  initialState?: S,
  resetStateKey?: any,
  children?: ReactNode | ContextStateRenderChildren<S>,

  actions?: A,
  selectors?: ContextSelectorsFactory<S, SS>,

  getStateFromProps?: {
    keys: any[],
    fn(newAppState: S, prevUpdaterKeys?: any[], keys?: any[]): S,
  },

  onBroadcastedState?(newState?: S, prevState?: S, differs?: boolean): void,
};

type ContextProviderState<S> = {
  appState: S,
  prevUpdaterKeys: any[],
};

/**
 * It is tiny clone of
 *  https://github.com/diegohaz/constate
 *
 * but react constate has great API but it is slooow and
 * selectors are not cached. It is just smaller and faster
 * clone of this lib with caching, suited for tracking
 */
export class ContextStateProvider<S, A = {}, SS = {}> extends React.Component<
ContextStateProviderProps<S, A, SS>,
ContextProviderState<S>
> {
  subscribers = [];

  computedStateCache: {
    appState?: S,
    computedState?: ComputedState<S, A, SS>,
  } = {};

  state = {
    appState: null,
    prevUpdaterKeys: null, // used by getSteteFromProps
  };

  static getDerivedStateFromProps(
    {initialState, resetStateKey, getStateFromProps},
    {appState, prevUpdaterKeys, prevResetStateKey},
  ) {
    let newAppState = null;

    if (!isNil(prevResetStateKey)
        && prevResetStateKey !== resetStateKey
        && resetStateKey !== undefined) {
      newAppState = initialState;
    } else {
      newAppState = appState || initialState;
    }

    if (getStateFromProps) {
      const {keys, fn} = getStateFromProps;

      const keysUpdated = (fn && !shallowCompareArrays(keys, prevUpdaterKeys || []));
      const newState = (
        keysUpdated
          ? fn(newAppState, prevUpdaterKeys, keys)
          : newAppState
      );

      return {
        prevResetStateKey: resetStateKey,
        prevUpdaterKeys: keys,
        appState: newState,
      };
    }

    return {
      prevResetStateKey: resetStateKey,
      appState: newAppState,
    };
  }

  componentDidUpdate(prevProps: ContextStateProviderProps<S, A, SS>, prevState: ContextProviderState<S>) {
    if (prevState.appState !== this.state.appState)
      this.broadcastState();
  }

  getComputedContextState(appState: S): ComputedState<S, A, SS> {
    const {computedStateCache: fastCache} = this;

    if (fastCache.appState !== appState) {
      const {
        resetStateKey, actions, selectors,
      } = this.props;

      // resetStateKey is optional arg, cache killer used in fast state swap
      const linkedSelectors = (this.createSelectors as any)(
        selectors ?? always({}),
        resetStateKey,
      );

      fastCache.appState = appState;
      fastCache.computedState = {
        state: appState,
        actions: this.linkActionsToState(actions, linkedSelectors) as any,
        selectors: linkedSelectors,
      };
    }

    return fastCache.computedState;
  }

  setBroadcastedState = (updater) => {
    const {onBroadcastedState} = this.props;
    const {appState} = this.state;
    const newState = updater(appState);

    const differs = newState !== appState;

    if (differs) {
      this.state.appState = newState;
      this.broadcastState();
    }

    // eslint-disable-next-line no-unused-expressions
    onBroadcastedState?.(newState, appState, differs);
  };

  @MemoizeMethod
  getContextValue(): StateContext<S, A, SS> {
    const unsubscribe = (fn: any) => {
      this.subscribers = without([fn], this.subscribers);
    };

    return {
      getState: () => this.getComputedContextState(this.state.appState),
      subscribe: (fn) => {
        this.subscribers.push(fn);

        return () => {
          this.subscribers = without([fn], this.subscribers);
        };
      },
      unsubscribe,
    };
  }

  broadcastState = (): void => {
    const computedAppState = this.getComputedContextState(this.state.appState);

    forEach(
      (subscriberFn) => subscriberFn && subscriberFn(computedAppState),
      this.subscribers,
    );
  };

  /**
   * Creates selectors
   *
   * @param {Object} selectors
   * @returns {Object}
   */
  /* eslint-disable class-methods-use-this */
  @MemoizeMethod
  createSelectors(selectors: ContextSelectorsFactory<S, SS>): SS {
    return selectors(
      {
        getState: (): S => this.state.appState,
      },
    );
  }
  /* eslint-enable class-methods-use-this */

  /**
   * Wraps each function to return its value into appState
   *
   * @param {Object}  actions
   * @param {Object}  linkedSelectors
   * @returns {Object}
   */
  @MemoizeMethod
  linkActionsToState(actions: A, linkedSelectors: SS): object {
    const mapper = (actionFn: ContextAction) => (...args: any[]) => {
      if (isSSR())
        actionFn(...args)(this.state.appState, linkedSelectors);
      else {
        this.setBroadcastedState(
          (appState: S) => actionFn(...args)(appState, linkedSelectors),
        );
      }
    };

    return mapObjIndexed(mapper, actions);
  }

  render() {
    const {
      children,
      contextComponent: ContextComponent,
    } = this.props;

    return (
      <ContextComponent value={this.getContextValue()}>
        {(
          is(Function, children)
            ? (children as ContextStateRenderChildren<S>)(this.state.appState)
            : children
        )}
      </ContextComponent>
    );
  }
}
