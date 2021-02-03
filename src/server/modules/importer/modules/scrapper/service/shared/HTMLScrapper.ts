import cheerio from 'cheerio';
import {concatUrls} from '@shared/helpers/concatUrls';

import {
  AsyncScrapper,
  AsyncScrapperConfig,
  ScrapperResult,
  WebsiteScrapperItemInfo,
} from './AsyncScrapper';

export type HTMLParserAttrs = {
  $: cheerio.Root,
};

export type HTMLScrapperConfig = AsyncScrapperConfig & {
  homepageURL?: string,
};

/**
 * Basic HTML scrapper, fetches HTML and parses it
 *
 * @export
 * @abstract
 * @class HTMLScrapper
 * @template T
 * @template WebsiteScrapperItemInfo
 */
export abstract class HTMLScrapper<
  T extends readonly WebsiteScrapperItemInfo<any>[],
> extends AsyncScrapper<T, string> {
  private readonly homepageURL: string;

  constructor({homepageURL, ...config}: HTMLScrapperConfig) {
    super(config);

    this.homepageURL = homepageURL;
  }

  /**
   * Fetches HTML, parses it and returns iterator
   *
   * @private
   * @param {string} url
   * @returns
   * @memberof HTMLScrapper
   */
  protected async process(url: string) {
    const html = await this.fetchHTML(
      concatUrls(
        this.homepageURL,
        url,
      ),
    );

    return this.parsePage(
      {
        $: cheerio.load(html),
      },
    );
  }

  /**
   * Returns HTML
   *
   * @protected
   * @param {string} url
   * @returns
   * @memberof HTMLScrapper
   */
  protected async fetchHTML(url: string) {
    return fetch(url).then((r) => r.text());
  }

  /**
   * Parses fetched page
   *
   * @protected
   * @param {HTMLParserAttrs} attrs
   * @returns {AsyncIterator<T>}
   * @memberof HTMLScrapper
   */
  protected abstract parsePage(attrs: HTMLParserAttrs): Promise<ScrapperResult<T, string>>;
}
