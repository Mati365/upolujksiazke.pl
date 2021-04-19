import {CacheModule, Global, Module} from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

import {SERVER_ENV} from '@server/constants/env';

import {RedisCacheWarmup} from './services/RedisCacheWarmup.service';
import {APIModule} from '../api';
import {BookModule} from '../book/Book.module';

@Global()
@Module(
  {
    imports: [
      APIModule,
      BookModule,
      CacheModule.register(
        {
          store: redisStore,
          noPromises: true,
          ...SERVER_ENV.redisConfig,
        },
      ),
    ],
    providers: [
      RedisCacheWarmup,
    ],
    exports: [
      CacheModule,
    ],
  },
)
export class RedisCacheModule {}
