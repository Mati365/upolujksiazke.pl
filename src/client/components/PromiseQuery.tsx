import {ReactElement} from 'react';
import {PromiseHookReturnType, usePromise} from '@client/hooks';

type PromiseQueryProps<T> = {
  skip?: boolean,
  promiseKeys: any[],
  promiseFn(): Promise<T>,
  children(
    attrs: PromiseHookReturnType<T>,
  ): ReactElement,
};

export function PromiseQuery<T = any>(
  {
    skip, children,
    promiseKeys, promiseFn,
  }: PromiseQueryProps<T>,
) {
  const promiseState = usePromise<T>(
    {
      fn: promiseFn,
      skip,
      keys: promiseKeys,
    },
  );

  return children(promiseState);
}
