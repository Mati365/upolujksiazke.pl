import {Injectable} from '@nestjs/common';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {WebsiteInfoScrapper} from './shared';

@Injectable()
export class WebsiteInfoScrapperService {
  /**
   * Loads or creates scrapper website
   *
   * @param {WebsiteInfoScrapper} scrapper
   * @returns
   * @memberof ScrapperService
   */
  async findOrCreateWebsiteEntity(scrapper: WebsiteInfoScrapper) {
    let website = await RemoteWebsiteEntity.findOne(
      {
        url: scrapper.websiteURL,
      },
    );

    if (!website) {
      website = await scrapper.fetchWebsiteEntity();
      await website.save();
    }

    return website;
  }
}
