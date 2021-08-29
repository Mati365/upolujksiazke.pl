import {Injectable} from '@nestjs/common';
import {In} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {RemoteWebsiteService} from '@server/modules/remote/service/RemoteWebsite.service';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {WebsiteInfoScrapper} from './WebsiteInfoScrapper';

@Injectable()
export class WebsiteInfoScrapperService {
  constructor(
    private readonly remoteWebsiteService: RemoteWebsiteService,
  ) {}

  /**
   * Loads or creates scrapper website
   *
   * @param {WebsiteInfoScrapper} scrapper
   * @returns
   * @memberof WebsiteInfoScrapperService
   */
  async findOrCreateWebsiteEntity(scrapper: WebsiteInfoScrapper) {
    return (await this.findOrCreateWebsitesEntities([scrapper]))[0];
  }

  /**
   * Finds or creates multiple websites
   *
   * @param {WebsiteInfoScrapper[]} scrappers
   * @param {boolean} [skipCacheCheck=false]
   * @returns
   * @memberof WebsiteInfoScrapperService
   */
  async findOrCreateWebsitesEntities(
    scrappers: WebsiteInfoScrapper[],
    skipCacheCheck: boolean = false,
  ) {
    const {remoteWebsiteService} = this;

    const urls = R.pluck('websiteURL', scrappers);
    const cachedWebsites = (
      skipCacheCheck
        ? []
        : await RemoteWebsiteEntity.find(
          {
            url: In(urls),
          },
        )
    );

    const cachedUrls = R.pluck('url', cachedWebsites);
    const missingWebsites = scrappers.filter(
      ({websiteURL}) => !cachedUrls.includes(websiteURL),
    );

    if (R.isEmpty(missingWebsites))
      return cachedWebsites;

    const newEntities = await pMap(
      missingWebsites,
      async (scrapper) => remoteWebsiteService.upsert(await scrapper.fetchWebsiteDTO()),
      {
        concurrency: 5,
      },
    );

    return [
      ...cachedWebsites,
      ...newEntities,
    ];
  }
}
