import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import * as R from 'ramda';
import {map, mergeMap, bufferCount} from 'rxjs/operators';

import {concatUrls} from '@shared/helpers/concatUrls';
import {extractPathname} from '@shared/helpers/urlExtract';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {EnterTmpFolderScope, TmpFolderScopeAttrs} from '@server/modules/tmp-dir';
import {
  Crawler,
  CrawlerTickResult,
  CrawlerConfig,
} from '../Crawler';

import {fetchAndExtractSitemap} from './utils/fetchAndExtractSitemap';

export type SitemapCrawlerConfig = CrawlerConfig & {
  sitemapFetcherConcurrency?: number,
  sitemaps: string[],
  tmpDirService: TmpDirService,
};

/**
 * Crawler that fetches single sitemap
 * and reads it as stream
 *
 * @export
 * @class SitemapCrawler
 * @extends {Crawler}
 */
export class SitemapCrawler extends Crawler<SitemapCrawlerConfig> {
  static readonly logger = new Logger(SitemapCrawler.name);

  constructor(config: SitemapCrawlerConfig) {
    super(
      {
        concurrency: 3,
        sitemapFetcherConcurrency: 5,
        ...config,
      },
    );
  }

  /**
   * @inheritdoc
   */
  async run$() {
    await this.extractLinksQueueToDB();
    return super.run$();
  }

  /**
   * @inheritdoc
   */
  async tick(): Promise<CrawlerTickResult> {
    const {
      config: {
        queueDriver,
      },
    } = this;

    const queueItem = await queueDriver.pop();
    if (!queueItem)
      return null;

    return {
      queueItem,
      collectorResult: {
        parseResult: await parseAsyncURLIfOK(queueItem.url),
      },
    };
  }

  /**
   * Fetches sitemap and put them into DB
   *
   * @param {TmpFolderScopeAttrs} [{tmpFolderPath}=null]
   * @memberof SitemapCrawler
   */
  @EnterTmpFolderScope(
    function tmpFolderConfig(this: SitemapCrawler) {
      return {
        dirService: this.config.tmpDirService,
        attrs: {
          deleteOnExit: false,
        },
      };
    },
  )
  private async extractLinksQueueToDB({tmpFolderPath}: TmpFolderScopeAttrs = null) {
    const {
      config: {
        queueDriver,
        storeOnlyPaths,
        sitemapFetcherConcurrency,
        sitemaps,
        preMapLink,
      },
    } = this;

    const $stream = await fetchAndExtractSitemap(
      {
        url: sitemaps[0], // todo: add support for multiple sitemaps
        concurrency: sitemapFetcherConcurrency,
        outputPath: tmpFolderPath,
      },
    );

    // load into database
    await (
      $stream
        .pipe(
          map(
            (item) => {
              const mapped = preMapLink(item);
              if (storeOnlyPaths)
                mapped.url = extractPathname(mapped.url);

              return mapped;
            },
          ),
          bufferCount(50),
          mergeMap(
            (links) => (
              queueDriver
                .push(R.uniqBy(R.prop('url'), links))
                .then(() => links)
            ),
            5,
          ),
        )
        .toPromise()
    );
  }

  /**
   * If sitemaps are present on page - create crawler
   *
   * @static
   * @param {string} homepageURL
   * @param {Omit<SitemapCrawlerConfig, 'sitemaps'>} config
   * @returns
   * @memberof SitemapCrawler
   */
  static async createIfSitemapPresent(homepageURL: string, config: Omit<SitemapCrawlerConfig, 'sitemaps'>) {
    const sitemaps = await this.getSitemapsUrls(homepageURL);
    if (!sitemaps.length)
      return null;

    return new SitemapCrawler(
      {
        ...config,
        sitemaps,
      },
    );
  }

  /**
   * Fetches all sitemaps URLs from provided url
   *
   * @static
   * @param {string} homepageURL
   * @returns {Promise<string[]>}
   * @memberof SitemapCrawler
   */
  static async getSitemapsUrls(homepageURL: string): Promise<string[]> {
    const {logger} = this;
    const robotsUrl = concatUrls(homepageURL, 'robots.txt');

    try {
      logger.warn(`Fetching ${chalk.bold(robotsUrl)}!`);

      const content = await fetch(robotsUrl).then((r) => r.text());
      return R.reject(
        R.isEmpty,
        R.map(
          R.nth(1),
          [...content.matchAll(/Sitemap:\s*(.*)/mgi)],
        ),
      );
    } catch (e) {
      logger.error(`Error when fetching ${chalk.bold(robotsUrl)}!`);

      return [];
    }
  }
}
