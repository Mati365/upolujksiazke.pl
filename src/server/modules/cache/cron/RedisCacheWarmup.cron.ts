import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import pMap from 'p-map';

import {Layout} from '@client/containers/layout';
import {APIClientService} from '@server/modules/api/services';
import {CardBookSearchService} from '@server/modules/book/services/search/CardBookSearch.service';

import {BookRoute} from '@client/routes/Book';
import {HomeRoute} from '@client/routes/Home';

@Injectable()
export class RedisCacheWarmupCron {
  constructor(
    private readonly bookSearchService: CardBookSearchService,
    private readonly apiService: APIClientService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: any,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async warmupCache() {
    await this.cacheManager.store.getClient().flushdb();

    await this.warmupHomeCache();
    await this.warmupLayoutCache();
    await this.warmupBooksCache();
  }

  /**
   * Warmups shared layout cache
   *
   * @memberof RedisCacheWarmup
   */
  async warmupLayoutCache() {
    await Layout.getInitialProps(
      {
        api: this.apiService.client,
        match: null,
      },
    );
  }

  /**
   * Warmup home route cache
   *
   * @memberof RedisCacheWarmup
   */
  async warmupHomeCache() {
    await HomeRoute.getInitialProps(
      {
        api: this.apiService.client,
        match: null,
      },
    );
  }

  /**
   * Warmups books routes
   *
   * @memberof RedisCacheWarmup
   */
  async warmupBooksCache() {
    const {
      bookSearchService,
      apiService: {
        client,
      },
    } = this;

    const iterator = bookSearchService.createMostPopularIdsIteratedQuery(
      {
        pageLimit: 40,
        maxOffset: 800,
      },
    );

    for await (const [, ids] of iterator) {
      await pMap(
        ids,
        (id) => BookRoute.getInitialProps(
          {
            api: client,
            match: {
              params: {
                id,
              },
            } as any,
          },
        ),
        {
          concurrency: 2,
        },
      );
    }
  }
}
