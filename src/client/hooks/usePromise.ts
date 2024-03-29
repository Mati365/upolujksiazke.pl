import {useState, useRef, useEffect} from 'react';

import {DiscardablePromiseWrapper} from '@shared/helpers/classes/DiscardablePromiseWrapper';
import {shallowCompareArrays} from '@shared/helpers';

type PromiseState<T> = {
  result: T,
  loading?: boolean,
  errors?: any,
};

type PromiseConfig<T> = {
  fn: (prevPromiseState?: PromiseState<T>) => Promise<T>,
  preserveContentOnReload?: boolean,
  keys?: any[],
  skip?: boolean,
  initialData?: T,
};

export type PromiseHookReturnType<T> = PromiseState<T> & {
  reload(silent?: boolean): Promise<T>,
  loadOptimisticPatch(
    fn: (current: T) => {
      // promise is discarded
      reloadContent: true,
      promise?: Promise<T | any>,
      optimistic: T,
    } | ({
      reloadContent?: boolean,
      promise?: Promise<T>,
      optimistic: T,
    }),
  ): Promise<any>;
};

export const usePromise = <T>(config: PromiseConfig<T>): PromiseHookReturnType<T> => {
  const prevOptimisticPatchPromise = useRef<DiscardablePromiseWrapper<T>>();
  const unmountedRef = useRef<boolean>(false);
  const prevKeys = useRef<any[]>();
  const prevQueryUUID = useRef<Number>();
  const [promiseState, setPromiseState] = useState<PromiseState<T>>(
    {
      result: config.initialData ?? null,
      loading: !config.skip,
    },
  );

  const discardPendingPatch = () => {
    if (prevOptimisticPatchPromise.current)
      prevOptimisticPatchPromise.current.discarded = true;

    prevOptimisticPatchPromise.current = null;
  };

  useEffect(
    () => () => {
      unmountedRef.current = true;
    },
    [],
  );

  if (!config.skip
      && (!config.initialData || prevKeys.current)
      && !shallowCompareArrays(prevKeys.current, config.keys)
  ) {
    const queryUUID = Date.now();

    prevQueryUUID.current = queryUUID;
    prevKeys.current = config.keys;
    discardPendingPatch();

    if (!promiseState.loading) {
      promiseState.loading = true;
      setPromiseState(
        (prevState) => ({
          errors: null,
          loading: true,
          result: (
            config.preserveContentOnReload
              ? prevState.result
              : null
          ),
        }),
      );
    }

    config
      .fn(promiseState)
      .then((data: T) => {
        if (prevQueryUUID.current !== queryUUID || unmountedRef.current)
          return;

        setPromiseState(
          {
            result: data,
            loading: false,
          },
        );
      })
      .catch((err) => {
        if (prevQueryUUID.current !== queryUUID || unmountedRef.current)
          return;

        setPromiseState(
          {
            errors: [err],
            loading: false,
            result: null,
          },
        );
      });
  }

  const reload = async (silent?: boolean): Promise<T> => {
    if (prevOptimisticPatchPromise.current)
      return null;

    const queryUUID = Date.now();
    prevQueryUUID.current = queryUUID;

    if (!silent) {
      setPromiseState(
        (state) => ({
          ...state,
          errors: null,
          loading: true,
        }),
      );
    }

    try {
      const data = await config.fn(promiseState);
      if (prevQueryUUID.current !== queryUUID || unmountedRef.current)
        return null;

      setPromiseState(
        (state) => ({
          ...state,
          result: data,
          loading: false,
          errors: null,
        }),
      );

      return data;
    } catch (e) {
      if (prevQueryUUID.current !== queryUUID || unmountedRef.current)
        return null;

      console.error(e);
      if (!silent) {
        setPromiseState(
          (state) => ({
            ...state,
            loading: false,
            errors: null,
          }),
        );
      }
    }

    return null;
  };

  const loadOptimisticPatch: PromiseHookReturnType<T>['loadOptimisticPatch'] = (optimisticExecutor): Promise<any> => {
    const executorResult = optimisticExecutor(promiseState.result);

    let {promise} = executorResult;
    const {
      optimistic,
      reloadContent,
    } = executorResult;

    discardPendingPatch();

    const cachedResult = promiseState.result;
    setPromiseState(
      (state) => ({
        ...state,
        result: optimistic,
      }),
    );

    // reload anyway
    if (reloadContent) {
      const cachedMutationPromise = promise ?? Promise.resolve<T>(null);

      promise = new Promise<T>((resolve, reject) => {
        const next = () => config.fn().then(resolve, reject);

        cachedMutationPromise
          .then(next)
          .catch(reject);
      });
    }

    if (promise) {
      const discardablePromise = DiscardablePromiseWrapper.fork(promise);

      return new Promise((_resolve, _reject) => {
        prevOptimisticPatchPromise.current = discardablePromise;
        discardablePromise
          .promise
          .then(
            (newData: T) => {
              setPromiseState(
                (state) => ({
                  ...state,
                  result: newData,
                }),
              );
              _resolve(newData);
            },
          )
          .catch((e) => {
            setPromiseState(
              (state) => ({
                ...state,
                result: cachedResult,
              }),
            );
            _reject(e);
          })
          .finally(() => {
            prevOptimisticPatchPromise.current = null;
          });
      });
    }

    return null;
  };

  return {
    ...promiseState,
    reload,
    loadOptimisticPatch,
  };
};
