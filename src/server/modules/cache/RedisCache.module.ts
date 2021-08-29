import {
  CacheModule, Global, Module,
  Inject, OnModuleDestroy, CACHE_MANAGER,
} from '@nestjs/common';

import * as redisStore from 'cache-manager-redis-store';

import {SERVER_ENV} from '@server/constants/env';
import {WarmupCacheModule} from './modules/warmup/WarmupCache.module';

@Global()
@Module(
  {
    imports: [
      WarmupCacheModule,
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
      WarmupCacheModule,
    ],
  },
)
export class RedisCacheModule implements OnModuleDestroy {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: any,
  ) {}

  async onModuleDestroy() {
    await this.cacheManager.store?.getClient()?.quit();
  }
}
