import * as R from 'ramda';

import {extractHostname, extractPathname} from '@shared/helpers/urlExtract';
import {isAbsoluteURL} from '@shared/helpers/concatUrls';
import {getArrayWithLengthLimit} from '@shared/helpers/getArrayWithLengthLimit';
import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {CanBePromise} from '@shared/types';

import {concatWithAnchor} from '../helpers/concatWithAnchor';
import {
  Crawler,
  CrawlerConfig,
  CrawlerLink,
  CrawlerPageResult,
  CrawlerTickResult,
} from './Crawler';

export type CrawlerLinksMapperAttrs = {
  link: CrawlerLink,
  links: CrawlerLink[],
  parseResult?: AsyncURLParseResult,
};

export type SpiderCrawlerConfig = CrawlerConfig & {
  localHistorySize?: number,
  defaultUrl: string,
  extractFollowLinks?(attrs: CrawlerLinksMapperAttrs): (CanBePromise<CrawlerLink[]> | void);
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
        concurrency: 3,
        delay: 5000,
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
  run$() {
    const {
      config: {
        localHistorySize,
      },
    } = this;

    this.stackCache = getArrayWithLengthLimit<string>(localHistorySize);
    return super.run$();
  }

  /**
   * @inheritdoc
   */
  async tick(): Promise<CrawlerTickResult> {
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
        extractFollowLinks,
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

    if (extractFollowLinks) {
      followLinks = (<CrawlerLink[]> await extractFollowLinks(
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
