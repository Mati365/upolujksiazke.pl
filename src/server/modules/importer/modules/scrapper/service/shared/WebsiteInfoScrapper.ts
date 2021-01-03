import {parseAsyncURL} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';

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

  async fetchWebsiteEntity(): Promise<RemoteWebsiteEntity> {
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
    const {$} = await parseAsyncURL(url);
    const faviconUrl = $('[rel="shortcut icon"], [rel="icon"]').attr('href');

    return new RemoteWebsiteEntity(
      {
        url,
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        faviconUrl: concatUrls(url, faviconUrl),
      },
    );
  }
}
