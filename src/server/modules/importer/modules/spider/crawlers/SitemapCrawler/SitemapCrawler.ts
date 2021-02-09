import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import * as R from 'ramda';

import {concatUrls} from '@shared/helpers/concatUrls';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {EnterTmpFolderScope} from '@server/modules/tmp-dir';
import {
  Crawler,
  CrawlerConfig,
} from '../Crawler';

export type SitemapCrawlerConfig = CrawlerConfig & {
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

  /**
   * @inheritdoc
   */
  @EnterTmpFolderScope(
    function tmpFolderConfig(this: SitemapCrawler) {
      return {
        dirService: this.config.tmpDirService,
        attrs: {
          deleteOnExit: true,
        },
      };
    },
  )
  async run$() {
    const {config: {sitemaps}} = this;

    console.info(sitemaps);
    throw new Error('Method not implemented.');
    return null;
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
