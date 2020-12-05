import {useState, useEffect, useImperativeHandle} from 'react';
import * as R from 'ramda';

import {isDevMode} from '@shared/helpers';
import {useInterval} from './useInterval';
import {useMountedIndicatorRef} from './useMounted';

export type AsyncIntervalAsyncRef = React.Ref<{
  reload: VoidFunction,
}>;

type AsyncIntervalFetchParams<T> = {
  asyncRef?: AsyncIntervalAsyncRef,
  refetchIfPrevResultPresent?: boolean,
  initialResult?: T,
  delay: number,
  promiseFn(prevValue?: T): Promise<T>,
  onCronResultChanged?(value?: T): void,
};

export function useAsyncIntervalFetch<T>(
  {
    asyncRef,
    refetchIfPrevResultPresent,
    initialResult,
    delay,
    promiseFn,
    onCronResultChanged,
  }: AsyncIntervalFetchParams<T>,
) {
  if (isDevMode())
    delay *= 10;

  const [result, setResult] = useState<T>(initialResult);
  const mountedRef = useMountedIndicatorRef();
  const skipFetch = delay === null || (refetchIfPrevResultPresent && R.isNil(result));

  const execFetcher = (silent?: boolean) => {
    if (skipFetch)
      return;

    promiseFn(result).then((newResult) => {
      if (mountedRef.current !== false) {
        setResult(newResult);

        if (!silent && result !== newResult) {
          // eslint-disable-next-line no-unused-expressions
          onCronResultChanged?.(result);
        }
      }
    });
  };

  useImperativeHandle(
    asyncRef,
    () => ({
      reload: () => execFetcher(true),
    }),
  );

  useEffect(execFetcher, []);
  useInterval(
    execFetcher,
    skipFetch
      ? null
      : delay,
  );

  return {
    result,
    setResult,
  };
}
