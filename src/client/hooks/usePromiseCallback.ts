import {
  useState,
  useRef,
  useCallback,
} from 'react';

import * as R from 'ramda';

import {CanBePromise} from '@shared/types';
import {useMountedIndicatorRef} from './useMounted';

type PromiseFn = (...args: any[]) => CanBePromise<any>;

export type PromiseState<T> = {
  result?: T,
  errors?: boolean | any[],
  success?: boolean,
  loading?: boolean,
};

const usePromiseState = <T>(config?: any) => useState<PromiseState<T>>(
  {
    result: null,
    error: null,
    success: null,
    loading: false,
    ...config,
  },
);

type PromiseCallbackParams<T> = {
  initialPromiseState?: PromiseState<T>,
  silent?: boolean,
  rethrow?: boolean,
  resultParserFn?: (val: any) => T,
  afterExecFn?: (withError: boolean, result: T, error?: any) => void,
  errorSelectorFn?: (e: any) => any,
};

type PromiseCallbackResult<T> = [
  (...args: any[]) => Promise<T>,
  PromiseState<T>,
];

/**
 * @param {Function} promiseFn
 *
 * @returns Callback with executes promiseFn and sets loading / error flags
 */
export const usePromiseCallback = <T> (
  promiseFn: PromiseFn,
  {
    initialPromiseState = null,
    silent = false,
    rethrow = true,
    afterExecFn = R.F,
    resultParserFn = R.identity,
    errorSelectorFn,
  }: PromiseCallbackParams<T> = {},
): PromiseCallbackResult<T> => {
  const [promiseState, setPromiseState] = usePromiseState<T>(initialPromiseState);
  const mountedRef = useMountedIndicatorRef();
  const promiseFnRef = useRef<(...args: any[]) => Promise<any>>();

  promiseFnRef.current = async (...args: any[]) => {
    try {
      if (!silent && (!promiseState.loading || promiseState.errors)) {
        setPromiseState(
          {
            ...promiseState,
            errors: false,
            loading: true,
          },
        );
      }

      let result = await promiseFn(...args);
      const resultErrors = (result && ((<any> result).error || (<any> result).errors)) || null;
      if (!resultErrors)
        result = resultParserFn(result);

      if (mountedRef.current && !silent) {
        setPromiseState(
          {
            result,
            loading: false,
            ...(
              resultErrors
                ? {errors: resultErrors, success: false}
                : {errors: false, success: false}
            ),
          },
        );
      }

      afterExecFn(!!resultErrors, result);
      return result;
    } catch (e) {
      console.error(e);
      afterExecFn(true, null, e);

      if (mountedRef.current && !silent) {
        setPromiseState(
          {
            result: null,
            loading: false,
            errors: errorSelectorFn?.(e) || true,
          },
        );
      }

      if (rethrow)
        throw e;
    }

    return null;
  };

  const fn = useCallback(
    (...args) => promiseFnRef.current(...args),
    [],
  );

  return [
    fn,
    promiseState,
  ];
};
