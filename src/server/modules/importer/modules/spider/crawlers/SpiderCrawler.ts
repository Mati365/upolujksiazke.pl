import {merge, from} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import * as R from 'ramda';

import {asyncIteratorToObservable} from '@server/common/helpers/rx/asyncIteratorToObservable';
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
    super(
      {
        delay: 1000,
        concurrentRequests: 1,
        localHistorySize: 1000,
        ...config,
      },
    );
  }

  /**
   * Starts crawler
   *
   * @returns
   * @memberof SpiderCrawler
   */
  run$() {
    const {config: {concurrentRequests}} = this;
    const $stream = from(this.tick());

    return $stream.pipe(
      mergeMap(() => merge(...R.times(
        () => this.fork(),
        concurrentRequests,
      ))),
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

    const iterator = async function* generator() {
      self.stackCache = getArrayWithLengthLimit<string>(localHistorySize);

      for (;;) {
        const result = await self.tick();
        if (!result)
          break;

        yield result;
        await timeout(delay);
      }
    };

    return asyncIteratorToObservable(iterator());
  }

  /**
   * Picks first item and processes it
   *
   * @returns {Promise<AsyncURLParseResult>}
   * @memberof SpiderCrawler
   */
  async tick(): Promise<AsyncURLParseResult> {
    const {config: {queueDriver}} = this;
    const url = await queueDriver.pop();

    console.info(url);
    await timeout(5000);
    return null;
  }
}
