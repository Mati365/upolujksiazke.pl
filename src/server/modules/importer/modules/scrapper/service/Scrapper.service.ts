import * as R from 'ramda';
import {Injectable} from '@nestjs/common';

import {SERVER_ENV} from '@server/constants/env';
import {extractHostname} from '@shared/helpers';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import * as Groups from '@importer/sites';

import {WebsiteScrappersGroup} from './shared';
import {WebsiteInfoScrapperService} from './scrappers/WebsiteInfoScrapper';

const {parsers: PARSERS_ENV} = SERVER_ENV;

@Injectable()
export class ScrapperService {
  public readonly scrappersGroups: WebsiteScrappersGroup[] = null;

  constructor(
    private readonly websiteInfoService: WebsiteInfoScrapperService,
  ) {
    this.scrappersGroups = [
      new Groups.LekturyGovScrappersGroup(PARSERS_ENV.lekturyGov),
      new Groups.PublioScrappersGroup(PARSERS_ENV.publio),
      new Groups.BonitoScrappersGroup(PARSERS_ENV.bonito),
      new Groups.SkupszopScrappersGroup(PARSERS_ENV.skupszop),
      new Groups.GildiaScrappersGroup(PARSERS_ENV.gildia),
      new Groups.GraniceScrappersGroup(PARSERS_ENV.granice),
      new Groups.LiteraturaGildiaScrappersGroup(PARSERS_ENV.literaturaGildia),
      new Groups.MatrasScrappersGroup(PARSERS_ENV.matras), // sucky DB
      new Groups.DadadaScrappersGroup(PARSERS_ENV.dadada),
      new Groups.ArosScrappersGroup(PARSERS_ENV.aros),
      new Groups.MadBooksScrappersGroup(PARSERS_ENV.madbooks),
      new Groups.HrosskarScrappersGroup(PARSERS_ENV.hrosskar),
      new Groups.GandalfScrappersGroup(PARSERS_ENV.gandalf),
      new Groups.IbukScrappersGroup(PARSERS_ENV.ibuk),
      new Groups.WoblinkScrappersGroup(PARSERS_ENV.woblink),
      new Groups.TaniaksiazkaScrappersGroup(PARSERS_ENV.taniaksiazka),
      new Groups.BrykScrappersGroup(PARSERS_ENV.bryk),
      new Groups.StreszczeniaScrappersGroup(PARSERS_ENV.streszczenia),
      new Groups.KlpScrappersGroup(PARSERS_ENV.klp),
      new Groups.PolskiNa5ScrappersGroup(PARSERS_ENV.polskina5),
      new Groups.EszkolaScrappersGroup(PARSERS_ENV.eszkola),
      new Groups.WykopScrappersGroup(PARSERS_ENV.wykop),
      // new WikipediaScrappersGroup(PARSERS_ENV.wikipedia),
    ];
  }

  /**
   * Find single scrapper by assigned website URL
   *
   * @param {string} url
   * @returns {WebsiteScrappersGroup}
   * @memberof ScrapperService
   */
  getScrappersGroupByWebsiteURL(url: string): WebsiteScrappersGroup {
    const hostname = extractHostname(url);

    return R.find(
      (scrapper) => extractHostname(scrapper.websiteURL) === hostname,
      this.scrappersGroups,
    );
  }

  /**
   * Fetches website basic info by full url
   *
   * @param {string[]} urls
   * @returns {Promise<RemoteWebsiteEntity>}
   * @memberof ScrapperService
   */
  async findOrCreateWebsitesByUrls(urls: string[]): Promise<Record<string, RemoteWebsiteEntity>> {
    const entities = await this.websiteInfoService.findOrCreateWebsitesEntities(
      R.map(
        (url) => this.getScrappersGroupByWebsiteURL(url).websiteInfoScrapper,
        R.uniq(urls),
      ),
    );

    return urls.reduce(
      (acc, url) => {
        acc[url] = entities.find((website) => url.startsWith(website.url));
        return acc;
      },
      {},
    );
  }

  /**
   * Create single website instance for given url
   *
   * @param {string} url
   * @returns
   * @memberof ScrapperService
   */
  async findOrCreateWebsiteByUrl(url: string) {
    if (!url)
      return null;

    return (await this.findOrCreateWebsitesByUrls([url]))?.[url];
  }
}
