import cheerio from 'cheerio';
import {ScrapperWebsiteEntity} from '../../entity';

/**
 * Basic async scrapper that loads meta info from website
 *
 * @export
 * @class WebsiteInfoScrapper
 */
export class WebsiteInfoScrapper {
  constructor(
    public readonly websiteURL: string,
  ) {}

  async fetchWebsiteEntity(): Promise<ScrapperWebsiteEntity> {
    return WebsiteInfoScrapper.getWebsiteEntityFromURL(this.websiteURL);
  }

  /**
   * Fetches websites and parsers its meta tags
   *
   * @static
   * @param {string} url
   * @returns
   * @memberof WebsiteInfoScrapper
   */
  static async getWebsiteEntityFromURL(url: string) {
    const $ = cheerio.load(
      await fetch(url).then((r) => r.text()),
    );

    return new ScrapperWebsiteEntity(
      {
        url,
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        faviconUrl: $('link[rel="icon"]').attr('href'),
      },
    );
  }
}
