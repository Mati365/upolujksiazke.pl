import {isDevMode} from '@shared/helpers';

import {WrapMethod} from '@shared/helpers/decorators/WrapMethod';
import {ExpirableMemoizeCallAttrs} from '@shared/helpers/decorators/ExpirableMemoizeMethod';

import {APIClientChild} from '@api/APIClient';
import {ServerAPIClient} from '../client/ServerAPIClient';

export function RedisMemoize(keyFn: ExpirableMemoizeCallAttrs['keyFn']) {
  const devMode = isDevMode();

  return WrapMethod(
    (decoratedFn) => async function wrapped(this: APIClientChild<ServerAPIClient>, ...args: any[]) {
      const {cacheManager} = this.api.services;
      const {key, expire, disabled} = keyFn(...args);

      if (!devMode && !disabled) {
        const cached = await cacheManager.get<string>(key);
        if (cached)
          return JSON.parse(cached).result;
      }

      const result = await decoratedFn(...args);

      if (!devMode && !disabled) {
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
