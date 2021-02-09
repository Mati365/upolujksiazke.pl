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
  CrawlerLink,
  CrawlerPageResult,
} from './Crawler';

export type SpiderCrawlerConfig = CrawlerConfig & {
  localHistorySize?: number,
  defaultUrl: string,
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
        preMapLink: (link: string) => new CrawlerLink(link, 0),
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
  run$() {
    const {
      config: {
        concurrentRequests,
        localHistorySize,
      },
    } = this;

    this.stackCache = getArrayWithLengthLimit<string>(localHistorySize);

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
    const self = this;
    const {
      config: {
        delay,
        shouldBe,
      },
    } = this;

    const iterator = async function* generator() {
      for (;;) {
        const tickResult = await self.tick();
        if (!tickResult)
          break;

        const {
          collectorResult,
        } = tickResult;

        if (shouldBe.analyzed(tickResult))
          yield collectorResult;

        if (delay)
          await timeout(delay);
      }
    };

    return asyncIteratorToObservable(iterator());
  }

  /**
   * Picks first item and processes it
   *
   * @returns
   * @memberof SpiderCrawler
   */
  async tick() {
    const {
      config: {
        defaultUrl,
        queueDriver,
      },
    } = this;

    const queueItem = (await queueDriver.pop()) ?? new CrawlerLink(defaultUrl, 0);
    if (!queueItem)
      return null;

    const collectorResult = await this.collectUrlAnchors(queueItem);
    if (!collectorResult)
      return null;

    await queueDriver.push(collectorResult.followLinks);
    return {
      queueItem,
      collectorResult,
    };
  }

  /**
   * Fetches page and lists all anchors to be scrapped
   *
   * @private
   * @param {CrawlerLink} link
   * @returns {Promise<CrawlerPageResult>}
   * @memberof SpiderCrawler
   */
  private async collectUrlAnchors(link: CrawlerLink): Promise<CrawlerPageResult> {
    const {
      stackCache,
      config: {
        preMapLink,
        postMapLinks,
        storeOnlyPaths,
        shouldBe,
      },
    } = this;

    if (!link?.url)
      return null;

    const {url} = link;
    const hostname = extractHostname(url);
    const parseResult = await parseAsyncURLIfOK(url);
    if (!parseResult) {
      return {
        parseResult: null,
        followLinks: [],
      };
    }

    const {$} = parseResult;
    let followLinks: CrawlerLink[] = R.compose(
      R.map(preMapLink),
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

    if (postMapLinks) {
      followLinks = (<CrawlerLink[]> await postMapLinks(
        {
          links: followLinks,
          link,
          parseResult,
        },
      )) ?? followLinks;
    }

    stackCache.push(
      ...R.pluck('url', followLinks),
    );

    return {
      parseResult,
      followLinks,
    };
  }
}
