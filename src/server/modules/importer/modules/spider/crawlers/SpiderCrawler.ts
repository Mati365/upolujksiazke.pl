import {from, merge} from 'rxjs';
import * as R from 'ramda';

import {getArrayWithLengthLimit} from '@shared/helpers/getArrayWithLengthLimit';
import {timeout} from '@shared/helpers/async/timeout';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {Crawler, CrawlerConfig} from './Crawler';

type SpiderCrawlerConfig = CrawlerConfig & {
  shouldBeScrapped(url: string): boolean,
  localHistorySize?: number,
};

/**
 * Sitemap that jumps over whole page
 *
 * @export
 * @class SpiderCrawler
 * @extends {Crawler<SpiderCrawlerConfig>}
 */
export class SpiderCrawler extends Crawler<SpiderCrawlerConfig> {
  private stackCache: string[] = null;

  constructor(config: SpiderCrawlerConfig) {
    super(config);

    config.delay ??= 1000;
    config.localHistorySize ??= 1000;
  }

  /**
   * Starts crawler
   *
   * @returns
   * @memberof SpiderCrawler
   */
  run() {
    const {config: {concurrentRequests}} = this;
    const $stream = from(this.tick());

    return $stream.pipe(
      () => merge(
        ...R.times(
          () => this.fork(),
          concurrentRequests,
        ),
      ),
    );
  }

  /**
   * Run new crawler stream
   *
   * @returns
   * @memberof SpiderCrawler
   */
  fork() {
    const {config: {delay, localHistorySize}} = this;
    const self = this;

    return from(async function* generator() {
      self.stackCache = getArrayWithLengthLimit<string>(localHistorySize);

      for (;;) {
        const result = await self.tick();
        if (!result)
          break;

        yield result;
        await timeout(delay);
      }
    });
  }

  /**
   * Do crawler logic
   *
   * @returns {Promise<AsyncURLParseResult>}
   * @memberof SpiderCrawler
   */
  tick(): Promise<AsyncURLParseResult> {
    console.info('tick');
    return null;
  }
}
