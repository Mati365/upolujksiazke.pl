import React, {ReactNode} from 'react';
import {ReactComponentLike} from 'prop-types';
import * as R from 'ramda';

import {AnyCallback} from '@shared/types';
import {renderFunctionalChildren} from '@shared/helpers/renderFunctionalChildren';

type AsyncCallbackSet = {[key: string]: AnyCallback};

type AsyncPropsMapper = (asyncHandlers: string[], props: any) => AsyncCallbackSet;

const arrayPropWrapper = (wrapperFn: AnyCallback): AsyncPropsMapper => (
  asyncHandlers: string[],
  props: any,
): AsyncCallbackSet => R.reduce(
  (acc, key) => {
    if (props[key])
      acc[key] = wrapperFn(props[key]);

    return acc;
  },
  {},
  asyncHandlers,
);

export type AsyncSpinnerControlCustomizeProps = {
  loading?: boolean,
  spinnerComponent?: ReactComponentLike,
  loadingStateProps?: (loading?: boolean) => any,
};

export type AsyncSpinnerControlProps = AsyncSpinnerControlCustomizeProps & {
  controlComponent: ReactComponentLike,
  asyncHandlers: string[],
  children: ReactNode | ((loading: boolean) => ReactNode),
};

type AsyncSpinnerControlState = {
  loading: boolean,
  asyncOperations: number,
};

/**
 * Wrapper that hooks component props functions to trigger loading state
 *
 * @export
 * @class AsyncSpinnerControl
 * @extends {(React.Component<T & AsyncSpinnerControlProps, AsyncSpinnerControlState>)}
 * @template T
 */
export class AsyncSpinnerControl<T> extends React.Component<T & AsyncSpinnerControlProps, AsyncSpinnerControlState> {
  private wrapAsyncProps: AsyncPropsMapper;

  private mounted: boolean = true;

  constructor(props: T & AsyncSpinnerControlProps) {
    super(props);

    this.wrapAsyncProps = arrayPropWrapper(this.wrapWithAsyncListener);
    this.state = {
      loading: false,
      asyncOperations: 0,
    };
  }

  static getDerivedStateFromProps(props: AsyncSpinnerControlProps) {
    if (!R.isNil(props.loading)) {
      return {
        loading: props.loading,
      };
    }

    return null;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  wrapWithAsyncListener = (fn: AnyCallback) => async (...args: any[]) => {
    this.setState(
      (state) => ({
        loading: true,
        asyncOperations: state.asyncOperations + 1,
      }),
    );

    let result = null;
    try {
      result = await fn(...args);
    } catch (e) {
      console.error(e);
    }

    if (this.mounted) {
      this.setState(
        (state) => {
          const asyncOperations = Math.max(0, state.asyncOperations - 1);
          return {
            loading: asyncOperations > 0,
            asyncOperations,
          };
        },
      );
    }

    return result;
  };

  render() {
    const {loading} = this.state;
    const {
      controlComponent: Control,
      spinnerComponent: SpinnerComponent,
      loadingStateProps,
      asyncHandlers,
      children,
      loading: omitLoading,
      ...props
    } = this.props as AsyncSpinnerControlProps;

    // renderFunctionalChildren may return function
    // and controlComponent might be functional, like forms
    let content = renderFunctionalChildren(children, loading);
    if (SpinnerComponent) {
      content = (
        <SpinnerComponent />
      );
    }

    return (
      <Control
        {...props}
        {...asyncHandlers && this.wrapAsyncProps(asyncHandlers, props)}
        {...loadingStateProps && loadingStateProps(loading)}
      >
        {content}
      </Control>
    );
  }
}
