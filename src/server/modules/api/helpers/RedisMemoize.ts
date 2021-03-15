import {isDevMode} from '@shared/helpers';

import {WrapMethod} from '@shared/helpers/decorators/WrapMethod';
import {APIClientChild} from '@api/APIClient';
import {ServerAPIClient} from '../client/ServerAPIClient';

type RedisCacheCallAttrs = (...args: any[]) => {
  key: string,
  expire: number,
};

export function RedisMemoize(keyFn: RedisCacheCallAttrs) {
  const disabled = isDevMode();

  return WrapMethod(
    (decoratedFn) => async function wrapped(this: APIClientChild<ServerAPIClient>, ...args: any[]) {
      const {cacheManager} = this.api.services;
      const {key, expire} = keyFn(...args);

      if (!disabled) {
        const cached = await cacheManager.get<string>(key);
        if (cached)
          return JSON.parse(cached).result;
      }

      const result = await decoratedFn(...args);

      if (!disabled) {
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
