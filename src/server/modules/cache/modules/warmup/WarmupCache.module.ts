import {Global, Module, forwardRef} from '@nestjs/common';

import {BookSearchModule} from '@server/modules/book/modules/search/BookSearch.module';
import {WarmupCacheCron} from './WarmupCache.cron';
import {RedisCacheModule} from '../../RedisCache.module';

@Global()
@Module(
  {
    imports: [
      forwardRef(() => RedisCacheModule),
      BookSearchModule,
    ],
    providers: [
      WarmupCacheCron,
    ],
    exports: [
      WarmupCacheCron,
    ],
  },
)
export class WarmupCacheModule {}
