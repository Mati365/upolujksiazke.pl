import {convertMinutesToMiliseconds} from '@shared/helpers';

import {WrapMethod} from '@shared/helpers/decorators/WrapMethod';
import {LRUCacheConfig, LRUMemCache} from '@shared/helpers/classes/LRUMemCache';
import {ExpirableMemoizeCallAttrs} from '@shared/helpers/decorators/ExpirableMemoizeMethod';

import {APIClientChild} from '@api/APIClient';
import {ServerAPIClient} from '../client/ServerAPIClient';

type RedisMemoizeAttrs = Pick<ExpirableMemoizeCallAttrs, 'keyFn'> & {
  lru?: LRUCacheConfig,
};

export function RedisMemoize(
  {
    keyFn,
    lru = {
      maxSize: 8,
    },
  }: RedisMemoizeAttrs,
) {
  const lruCache = lru && new LRUMemCache(
    {
      ...lru,
      maxAge: lru.maxAge ?? convertMinutesToMiliseconds(15),
    },
  );

  return WrapMethod(
    (decoratedFn) => async function wrapped(this: APIClientChild<ServerAPIClient>, ...args: any[]) {
      const {cacheManager} = this.api.services;
      const {key, expire, disabled} = keyFn(...args);

      if (!disabled) {
        const lruCached = lruCache.get<any>(key);
        if (lruCached)
          return lruCached;

        const cached = await cacheManager.get<string>(key);
        if (cached) {
          const {result} = JSON.parse(cached);
          lruCache?.set(key, result);
          return result;
        }
      }

      const result = await decoratedFn(...args);
      if (!disabled) {
        lruCache?.set(key, result);

        await cacheManager.set<string>(
          key,
          JSON.stringify({result}),
          {
            ttl: expire,
          },
        );
      }

      return result;
    },
  );
}
