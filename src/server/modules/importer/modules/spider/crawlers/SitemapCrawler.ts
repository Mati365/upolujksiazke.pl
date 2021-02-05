import {Crawler} from './Crawler';

/**
 * Crawler that fetches single sitemap
 * and reads it as stream
 *
 * @export
 * @class SitemapCrawler
 * @extends {Crawler}
 */
export class SitemapCrawler extends Crawler {
  run(): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Checks homepage if contains URL to sitemap.
   * If so return sitemap URL
   *
   * @static
   * @param {string} homepageURL
   * @returns {string}
   * @memberof SitemapCrawler
   */
  static checkIfSitemapExists(homepageURL: string): string {
    console.info(homepageURL);
    return null;
  }
}
