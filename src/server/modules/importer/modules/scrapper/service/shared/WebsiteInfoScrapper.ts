import * as R from 'ramda';

import {parseAsyncURL} from '@server/common/helpers/fetchAsyncHTML';
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
    const $ = await parseAsyncURL(url);

    let faviconUrl = $('[rel="shortcut icon"], [rel="icon"]').attr('href');
    if (faviconUrl && R.startsWith('/', faviconUrl))
      faviconUrl = `${R.endsWith('/', url) ? R.init(url) : url}${faviconUrl}`;

    return new RemoteWebsiteEntity(
      {
        url,
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        faviconUrl,
      },
    );
  }
}
