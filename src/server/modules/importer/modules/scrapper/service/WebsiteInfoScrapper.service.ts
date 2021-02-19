import {Injectable} from '@nestjs/common';
import {In} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

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
    return (await this.findOrCreateWebsitesEntities([scrapper]))[0];
  }

  /**
   * Finds or creates multiple websites
   *
   * @param {WebsiteInfoScrapper[]} scrappers
   * @returns
   * @memberof WebsiteInfoScrapperService
   */
  async findOrCreateWebsitesEntities(scrappers: WebsiteInfoScrapper[]) {
    const urls = R.pluck('websiteURL', scrappers);
    const cachedWebsites = await RemoteWebsiteEntity.find(
      {
        url: In(urls),
      },
    );

    const cachedUrls = R.pluck('url', cachedWebsites);
    const missingWebsites = scrappers.filter(
      ({websiteURL}) => !cachedUrls.includes(websiteURL),
    );

    if (R.isEmpty(missingWebsites))
      return cachedWebsites;

    const newEntities = await pMap(
      missingWebsites,
      (scrapper) => scrapper.fetchWebsiteEntity(),
      {
        concurrency: 5,
      },
    );

    await RemoteWebsiteEntity.save(newEntities);
    return [
      ...cachedWebsites,
      ...newEntities,
    ];
  }
}
