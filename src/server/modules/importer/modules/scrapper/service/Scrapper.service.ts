import * as R from 'ramda';
import {Injectable} from '@nestjs/common';

import {SERVER_ENV} from '@server/constants/env';
import {extractHostname} from '@shared/helpers';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {WykopAPI} from '@importer/sites/wykop/api/WykopAPI';
import {
  IbukScrappersGroup,
  GraniceScrappersGroup,
  MatrasScrappersGroup,
  GildiaScrappersGroup,
  LiteraturaGildiaScrappersGroup,
  SkupszopScrappersGroup,
  BonitoScrappersGroup,
  DadadaScrappersGroup,
  ArosScrappersGroup,
  PublioScrappersGroup,
  GandalfScrappersGroup,
  HrosskarScrappersGroup,
  MadBooksScrappersGroup,
  WoblinkScrappersGroup,
  TaniaksiazkaScrappersGroup,
  LekturyGovScrappersGroup,
  WykopScrappersGroup,
  BrykScrappersGroup,
  StreszczeniaScrappersGroup,
} from '@importer/sites';

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
      new LekturyGovScrappersGroup(PARSERS_ENV.lekturyGov),
      new PublioScrappersGroup(PARSERS_ENV.publio),
      new BonitoScrappersGroup(PARSERS_ENV.bonito),
      new SkupszopScrappersGroup(PARSERS_ENV.skupszop),
      new GildiaScrappersGroup(PARSERS_ENV.gildia),
      new GraniceScrappersGroup(PARSERS_ENV.granice),
      new LiteraturaGildiaScrappersGroup(PARSERS_ENV.literaturaGildia),
      new MatrasScrappersGroup(PARSERS_ENV.matras), // sucky DB
      new DadadaScrappersGroup(PARSERS_ENV.dadada),
      new ArosScrappersGroup(PARSERS_ENV.aros),
      new MadBooksScrappersGroup(PARSERS_ENV.madbooks),
      new HrosskarScrappersGroup(PARSERS_ENV.hrosskar),
      new GandalfScrappersGroup(PARSERS_ENV.gandalf),
      new IbukScrappersGroup(PARSERS_ENV.ibuk),
      new WoblinkScrappersGroup(PARSERS_ENV.woblink),
      new TaniaksiazkaScrappersGroup(PARSERS_ENV.taniaksiazka),
      new BrykScrappersGroup(PARSERS_ENV.bryk),
      new StreszczeniaScrappersGroup(PARSERS_ENV.streszczenia),
      new WykopScrappersGroup(
        {
          homepageURL: PARSERS_ENV.wykop.homepageURL,
          api: new WykopAPI(
            {
              authConfig: PARSERS_ENV.wykop.authConfig,
            },
          ),
        },
      ),
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
