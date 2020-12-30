import {Injectable} from '@nestjs/common';

import {ScrapperWebsiteEntity} from '../entity';
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
    let website = await ScrapperWebsiteEntity.findOne(
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
