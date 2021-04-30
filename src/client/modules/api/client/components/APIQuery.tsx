import React, {useEffect, useRef, FunctionComponent, ReactNode, useImperativeHandle} from 'react';

import {useDebounce} from '@client/hooks/useDebounce';

import {CanBePromise} from '@shared/types';
import {ErrorBoundary} from '@client/components/ui/ErrorBoundary';
import {PromiseState, usePromiseCallback} from '@client/hooks/usePromiseCallback';
import {APICallConfig} from '@api/jwt/JwtAPIClient';
import {
  QueryLoadingSpinner,
  QueryErrorMessage,
} from './DefaultLoaders';

import {useAjaxAPIClient} from '../hooks/useAjaxAPIClient';
import {AjaxAPIClient} from '../AjaxAPIClient';

const DEFAULT_PROMISE_EXECUTOR_CONFIG = {
  rethrow: false,
  initialPromiseState: {
    errors: false,
    loading: true,
  },
};

const DEFAULT_NON_INITIAL_LOADING_EXECUTOR_CONFIG = {
  ...DEFAULT_PROMISE_EXECUTOR_CONFIG,
  initialPromiseState: {
    ...DEFAULT_PROMISE_EXECUTOR_CONFIG.initialPromiseState,
    loading: false,
  },
};

type APIQuerychildrenAttrs<T> = PromiseState<T> & {
  loader?: ReactNode,
  reload: VoidFunction,
};

export type APIQueryProps<T> = {
  asyncRef?: React.Ref<APIQuerychildrenAttrs<T>>,
  debounce?: number,
  ignoreFirstRenderFetch?: boolean,
  initialInstant?: boolean,
  provideLoaderAsProp?: boolean,
  config?: APICallConfig,
  promiseFn?(attrs: {api: AjaxAPIClient}): CanBePromise<T>,
  promiseKey?: any,
  children(attrs: APIQuerychildrenAttrs<T>): any,
  loadingComponent?: FunctionComponent<any>,
  errorComponent?: FunctionComponent<any>,
};

export const APIQuery = <T extends unknown>(
  {
    ignoreFirstRenderFetch,
    asyncRef,
    provideLoaderAsProp,
    config = {},
    promiseKey,
    promiseFn,
    children,
    initialInstant = true,
    debounce = 0,
    loadingComponent: LoadingComponent = QueryLoadingSpinner,
    errorComponent: ErrorComponent = QueryErrorMessage,
  }: APIQueryProps<T>,
) => {
  const initialRender = useRef<boolean>(true);
  const api = useAjaxAPIClient();
  const prevKey = useRef<string>(null);

  const [execPromise, promiseState] = usePromiseCallback<T>(
    () => (
      promiseFn
        ? promiseFn(
          {
            api,
          },
        )
        : api.asyncCaller.apiCall(config)
    ),
    ignoreFirstRenderFetch
      ? DEFAULT_NON_INITIAL_LOADING_EXECUTOR_CONFIG
      : DEFAULT_PROMISE_EXECUTOR_CONFIG,
  );

  const debouncedExec = useDebounce(
    {
      initialInstant,
      delay: debounce,
    },
    execPromise,
  );

  // faster check if loading flag is triggered
  let loader: ReactNode = null;
  const newKey = JSON.stringify(promiseKey ?? config);
  const loading = promiseState?.loading || (!initialRender.current && newKey !== prevKey.current);
  prevKey.current = newKey;

  useEffect(
    () => {
      const ignore = ignoreFirstRenderFetch && initialRender.current;
      initialRender.current = false;

      if (!ignore)
        debouncedExec();
    },
    [newKey],
  );

  if (LoadingComponent && loading) {
    loader = (
      <LoadingComponent />
    );
  } else if (ErrorComponent && promiseState?.errors) {
    loader = (
      <ErrorComponent />
    );
  }

  const attrs: APIQuerychildrenAttrs<T> = {
    ...promiseState,
    ...loading && {
      errors: null,
    },
    reload: execPromise,
    loader,
    loading,
  };

  useImperativeHandle(
    asyncRef,
    () => attrs,
  );

  if (loader && !provideLoaderAsProp)
    return loader;

  let content = children(attrs);
  if (ErrorComponent) {
    content = (
      <ErrorBoundary
        renderError={() => (
          <ErrorComponent />
        )}
      >
        {content}
      </ErrorBoundary>
    );
  }

  return content;
};
