import {WrapMethod} from '@shared/helpers/decorators/WrapMethod';
import {APIClientChild} from '@api/APIClient';
import {ServerAPIClient} from '../client/ServerAPIClient';

type RedisCacheCallAttrs = (...args: any[]) => {
  key: string,
  expire: number,
};

export function RedisCacheCall(keyFn: RedisCacheCallAttrs) {
  return WrapMethod(
    (decoratedFn) => async function wrapped(this: APIClientChild<ServerAPIClient>, ...args: any[]) {
      const {cacheManager} = this.api.services;
      const {key, expire} = keyFn(...args);

      const cached = await cacheManager.get<string>(key);
      if (cached)
        return JSON.parse(cached).result;

      const result = await decoratedFn(...args);
      await cacheManager.set<string>(
        key,
        JSON.stringify({result}),
        {
          ttl: expire,
        },
      );

      return result;
    },
  );
}
