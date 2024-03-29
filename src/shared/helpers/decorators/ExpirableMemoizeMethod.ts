import {isPromise} from '@shared/guards/isPromise';
import {shallowMemoizeOneCall} from '../memoizeOne';

import {WrapMethod} from './WrapMethod';
import {
  KeyExpirableCacheStore,
  MemCache,
} from '../classes/MemCache';

export const MemoizeMethod = WrapMethod(shallowMemoizeOneCall);

export type ExpirableMemoizeCallAttrs = {
  cacheStore?: KeyExpirableCacheStore,
  keyFn: (...args: any[]) => {
    key: string,
    expire?: number,
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

      if (key && !disabled) {
        const cached = cacheStore.get<string>(key);
        if (cached)
          return cached;
      }

      const result = decoratedFn(...args);
      if (key && !disabled) {
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
