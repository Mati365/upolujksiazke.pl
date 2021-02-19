import {parseAsyncURL} from '@server/common/helpers/fetchAsyncHTML';
import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';

import {CreateRemoteWebsiteDto} from '@server/modules/remote/dto/CreateRemoteWebsite.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';

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

  /**
   * Fetches current website
   *
   * @returns {Promise<CreateRemoteWebsiteDto>}
   * @memberof WebsiteInfoScrapper
   */
  async fetchWebsiteDTO(): Promise<CreateRemoteWebsiteDto> {
    return WebsiteInfoScrapper.getWebsiteDtoFromURL(this.websiteURL);
  }

  /**
   * Fetches website and creates dto
   *
   * @static
   * @param {string} url
   * @returns {CreateRemoteWebsiteDto}
   * @memberof WebsiteInfoScrapper
   */
  static async getWebsiteDtoFromURL(url: string) {
    const {$} = await parseAsyncURL(url);
    let faviconUrl = $('[rel="shortcut icon"], [rel="icon"]').attr('href');

    if (!faviconUrl)
      faviconUrl = $('meta[property="og:image"]').attr('content');

    return new CreateRemoteWebsiteDto(
      {
        url,
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        logo: faviconUrl && new CreateImageAttachmentDto(
          {
            originalUrl: concatWithAnchor(url, faviconUrl),
          },
        ),
      },
    );
  }
}
