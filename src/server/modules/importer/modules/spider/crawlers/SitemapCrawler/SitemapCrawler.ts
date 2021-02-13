import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import * as R from 'ramda';
import {of} from 'rxjs';
import {
  map, mergeMap, delay,
  concatMap, bufferCount, mergeAll,
} from 'rxjs/operators';

import {concatUrls} from '@shared/helpers/concatUrls';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {EnterTmpFolderScope, TmpFolderScopeAttrs} from '@server/modules/tmp-dir';
import {
  Crawler,
  CrawlerConfig,
  CrawlerPageResult,
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
  async run$({tmpFolderPath}: TmpFolderScopeAttrs) {
    const {
      config: {
        queueDriver,
        concurrency,
        sitemapFetcherConcurrency,
        sitemaps,
        delay: delayTime,
        preMapLink,
      },
    } = this;

    const $stream = await fetchAndExtractSitemap(
      {
        url: sitemaps[0],
        concurrency: sitemapFetcherConcurrency,
        outputPath: tmpFolderPath,
      },
    );

    /**
     * @see
     *  Generates overflow! xml-parser must wait!
     */
    return (
      $stream
        .pipe(
          map(
            (item) => {
              const mapped = preMapLink(item);
              mapped.processed = true;
              return mapped;
            },
          ),
          bufferCount(30),
          mergeMap(
            // todo: add support for storeOnlyPaths
            (links) => queueDriver.push(links).then(() => links),
          ),
          mergeAll(),
          mergeMap(
            ({url}) => (
              of(parseAsyncURLIfOK(url))
                .pipe(delay(delayTime))
            ),
            concurrency,
          ),
          concatMap((x) => x),
          map(
            (parseResult): CrawlerPageResult => ({
              parseResult,
            }),
          ),
        )
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
