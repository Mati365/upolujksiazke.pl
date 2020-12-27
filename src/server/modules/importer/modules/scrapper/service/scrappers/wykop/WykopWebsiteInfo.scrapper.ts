import {ScrapperWebsiteEntity} from '@server/modules/importer/modules/scrapper/entity';
import {
  fetchWebsiteInfo,
  WebsiteInfoScrapper,
} from '../../shared';

/**
 * Picks info about website from wykop (favicon, description etc)
 *
 * @export
 * @class WykopWebsiteInfoScrapper
 * @implements {WebsiteInfoScrapper}
 */
export class WykopWebsiteInfoScrapper implements WebsiteInfoScrapper {
  public readonly websiteURL: string = 'https://wykop.pl';

  /**
   * Fetches website info
   *
   * @returns {Promise<ScrapperWebsiteEntity>}
   * @memberof WykopScrapper
   */
  async fetchWebsiteEntity(): Promise<ScrapperWebsiteEntity> {
    return fetchWebsiteInfo(this.websiteURL);
  }
}
