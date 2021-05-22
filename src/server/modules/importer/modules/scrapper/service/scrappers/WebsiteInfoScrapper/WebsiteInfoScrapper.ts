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
    public readonly info: CreateRemoteWebsiteDto,
  ) {}

  get withSubdomains() { return this.info.withSubdomains; }
  get websiteURL() { return this.info.url; }

  /**
   * Fetches current website
   *
   * @returns {Promise<CreateRemoteWebsiteDto>}
   * @memberof WebsiteInfoScrapper
   */
  async fetchWebsiteDTO(): Promise<CreateRemoteWebsiteDto> {
    const {info} = this;
    if (info.description && info.title)
      return info;

    return WebsiteInfoScrapper.fetchWebsiteDto(info);
  }

  /**
   * Fetches website and creates dto
   *
   * @static
   * @param {CreateRemoteWebsiteDto} {url, logo, withSubdomains}
   * @return {Promise<CreateRemoteWebsiteDto>}
   * @memberof WebsiteInfoScrapper
   */
  static async fetchWebsiteDto({url, logo, withSubdomains}: CreateRemoteWebsiteDto): Promise<CreateRemoteWebsiteDto> {
    const {$} = await parseAsyncURL(url);
    let faviconUrl = logo?.originalUrl || $('[rel="shortcut icon"], [rel="icon"]').attr('href');

    if (!faviconUrl)
      faviconUrl = $('meta[property="og:image"]').attr('content');

    return new CreateRemoteWebsiteDto(
      {
        url,
        withSubdomains,
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
