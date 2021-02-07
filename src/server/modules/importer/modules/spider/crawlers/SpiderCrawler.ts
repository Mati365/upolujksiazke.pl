import {merge, from} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import * as R from 'ramda';

import {timeout} from '@shared/helpers/async/timeout';
import {extractHostname, extractPathname} from '@shared/helpers/urlExtract';
import {isAbsoluteURL} from '@shared/helpers/concatUrls';

import {asyncIteratorToObservable} from '@server/common/helpers/rx/asyncIteratorToObservable';
import {getArrayWithLengthLimit} from '@shared/helpers/getArrayWithLengthLimit';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatWithAnchor} from '../helpers/concatWithAnchor';

import {
  Crawler,
  CrawlerConfig,
  CrawlerPageResult,
  CrawlerStartAttrs,
} from './Crawler';

type SpiderCrawlerConfig = CrawlerConfig & {
  localHistorySize?: number,
  shouldBe: {
    collected?(url: string): boolean,
    analyzed?(url: string): boolean,
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
  private stackCache: string[] = null;

  constructor({shouldBe, ...config}: SpiderCrawlerConfig) {
    super(
      {
        delay: 5000,
        concurrentRequests: 1,
        localHistorySize: 5000,
        shouldBe: {
          collected: R.T,
          analyzed: R.T,
          ...shouldBe,
        },
        ...config,
      },
    );
  }

  /**
   * @inheritdoc
   */
  run$(attrs: CrawlerStartAttrs) {
    const {
      config: {
        concurrentRequests,
        localHistorySize,
      },
    } = this;

    this.stackCache = getArrayWithLengthLimit<string>(localHistorySize);

    const $stream = from(this.tick(attrs));
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
    const self = this;
    const {
      config: {
        delay,
        shouldBe,
      },
    } = this;

    const iterator = async function* generator() {
      for (;;) {
        const result = await self.tick();
        if (!result)
          break;

        const {parseResult} = result;
        if (parseResult && shouldBe.analyzed(parseResult.url))
          yield result;

        await timeout(delay);
      }
    };

    return asyncIteratorToObservable(iterator());
  }

  /**
   * Picks first item and processes it
   *
   * @param {CrawlerStartAttrs} [attrs]
   * @returns {Promise<CrawlerPageResult>}
   * @memberof SpiderCrawler
   */
  async tick(attrs?: CrawlerStartAttrs): Promise<CrawlerPageResult> {
    const {
      config: {
        queueDriver,
      },
    } = this;

    const url = (await queueDriver.pop()) ?? attrs?.defaultUrl;
    if (!url)
      return null;

    const result = await this.collectUrlAnchors(url);
    if (!result)
      return null;

    await queueDriver.push(result.followPaths);
    return result;
  }

  /**
   * Fetches page and lists all anchors to be scrapped
   *
   * @private
   * @param {string} url
   * @returns {Promise<CrawlerPageResult>}
   * @memberof SpiderCrawler
   */
  private async collectUrlAnchors(url: string): Promise<CrawlerPageResult> {
    const {
      stackCache,
      config: {
        storeOnlyPaths,
        shouldBe,
      },
    } = this;

    if (!url)
      return null;

    const hostname = extractHostname(url);
    const parseResult = await parseAsyncURLIfOK(url);
    if (!parseResult) {
      return {
        parseResult: null,
        followPaths: [],
      };
    }

    const {$} = parseResult;
    const followPaths: string[] = R.compose(
      R.uniq,
      R.filter(Boolean) as any,
      R.map(
        (item) => {
          let anchorUrl = $(item).attr('href');
          if (!anchorUrl)
            return null;

          if (!isAbsoluteURL(anchorUrl))
            anchorUrl = concatWithAnchor(url, anchorUrl);
          else if (extractHostname(anchorUrl) !== hostname)
            return null;

          if (storeOnlyPaths)
            anchorUrl = extractPathname(anchorUrl);

          if (stackCache.includes(anchorUrl))
            return null;

          return (
            shouldBe.collected(anchorUrl)
              ? anchorUrl
              : null
          );
        },
      ),
    )(
      $('a').toArray(),
    );

    stackCache.push(...followPaths);
    return {
      parseResult,
      followPaths,
    };
  }
}
