import {isPromise} from '@shared/types';
import {shallowMemoizeOneCall} from '../memoizeOne';

import {WrapMethod} from './WrapMethod';
import {
  CacheStore,
  MemCache,
} from '../classes/MemCache';

export const MemoizeMethod = WrapMethod(shallowMemoizeOneCall);

export type ExpirableMemoizeCallAttrs = {
  cacheStore?: CacheStore,
  keyFn: (...args: any[]) => {
    key: string,
    expire: number,
    disabled?: boolean,
  },
};

export function ExpirableMemoize(
  {
    keyFn,
    cacheStore = new MemCache,
  }: ExpirableMemoizeCallAttrs,
) {
  return WrapMethod(
    (decoratedFn) => async function wrapped(...args: any[]) {
      const {key, expire, disabled} = keyFn(...args);

      if (!disabled) {
        const cached = cacheStore.get<string>(key);
        if (cached)
          return cached;
      }

      const result = decoratedFn(...args);
      if (!disabled) {
        const store = (data: any) => {
          cacheStore.setex(key, data, expire);
        };

        if (isPromise(result))
          result.then(store);
        else
          store(result);
      }

      return result;
    },
  );
}
