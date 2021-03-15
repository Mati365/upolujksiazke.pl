import {CacheModule, Global, Module} from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

import {SERVER_ENV} from '@server/constants/env';

@Global()
@Module(
  {
    imports: [
      CacheModule.register(
        {
          store: redisStore,
          noPromises: true,
          ...SERVER_ENV.redisConfig,
        },
      ),
    ],
    exports: [
      CacheModule,
    ],
  },
)
export class RedisCacheModule {}
