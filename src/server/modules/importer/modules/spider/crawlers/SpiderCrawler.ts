import {CanBePromise} from '@shared/types';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {Crawler, CrawlerConfig} from './Crawler';

type SpiderCrawlerConfig = CrawlerConfig & {
  shouldBeScrapped(url: string): boolean,
  cache: {
    localHistorySize?: number,
    isAlreadyScrapped(url: string): CanBePromise<boolean>,
    parseScrappedData(data: AsyncURLParseResult): CanBePromise<void>,
  },
};

/**
 * Sitemap that jumps over whole page
 *
 * @export
 * @class SpiderCrawler
 * @extends {Crawler<SpiderCrawlerConfig>}
 */
export class SpiderCrawler extends Crawler<SpiderCrawlerConfig> {
  constructor(config: SpiderCrawlerConfig) {
    super(config);

    config.delay ??= 1000;
    config.cache.localHistorySize ??= 1000;
  }

  run() {}
}
