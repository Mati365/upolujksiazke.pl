import * as R from 'ramda';
import {Injectable} from '@nestjs/common';
import {classToPlain} from 'class-transformer';

import {SERVER_ENV} from '@server/constants/env';
import {
  extractHostname,
  safeToString,
} from '@shared/helpers';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {WykopAPI} from '@server/modules/importer/sites/wykop/api/WykopAPI';
import {
  GraniceScrappersGroup,
  MatrasScrappersGroup,
  GildiaScrappersGroup,
  LiteraturaGildiaScrappersGroup,
  // WikipediaScrappersGroup,
  SkupszopScrappersGroup,
  BonitoScrappersGroup,
  DadadaScrappersGroup,
  ArosScrappersGroup,
  PublioScrappersGroup,
  WykopScrappersGroup,
} from '@server/modules/importer/sites';

import {
  ScrapperMetadataEntity,
  ScrapperMetadataStatus,
} from '../entity';

import {
  WebsiteScrapperItemInfo,
  WebsiteScrappersGroup,
} from './shared';

import {WebsiteInfoScrapperService} from './WebsiteInfoScrapper.service';

const {parsers: PARSERS_ENV} = SERVER_ENV;

@Injectable()
export class ScrapperService {
  public readonly scrappersGroups: WebsiteScrappersGroup[] = null;

  constructor(
    private readonly websiteInfoService: WebsiteInfoScrapperService,
  ) {
    this.scrappersGroups = [
      new PublioScrappersGroup(PARSERS_ENV.publio),
      new BonitoScrappersGroup(PARSERS_ENV.bonito),
      new SkupszopScrappersGroup(PARSERS_ENV.skupszop),
      new GildiaScrappersGroup(PARSERS_ENV.gildia),
      new GraniceScrappersGroup(PARSERS_ENV.granice),
      new LiteraturaGildiaScrappersGroup(PARSERS_ENV.literaturaGildia),
      new MatrasScrappersGroup(PARSERS_ENV.matras), // sucky DB
      new DadadaScrappersGroup(PARSERS_ENV.dadada),
      new ArosScrappersGroup(PARSERS_ENV.aros),
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
   * Wraps scrapper result into entity
   *
   * @static
   * @param {RemoteWebsiteEntity} website
   * @param {IdentifiedItem<RemoteID>} item
   * @param {ScrapperMetadataStatus} [status=ScrapperMetadataStatus.IMPORTED]
   * @returns
   * @memberof ScrapperService
   */
  static scrapperResultToMetadataEntity(
    website: RemoteWebsiteEntity,
    item: WebsiteScrapperItemInfo,
    status: ScrapperMetadataStatus = ScrapperMetadataStatus.IMPORTED,
  ) {
    const {
      kind,
      parserSource,
      remoteId,
      url,
      dto,
    } = item;

    return new ScrapperMetadataEntity(
      {
        status,
        kind,
        url,
        parserSource,
        remoteId: safeToString(remoteId),
        websiteId: website.id,
        content: classToPlain(dto),
      },
    );
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

    return entities.reduce(
      (acc, entity) => {
        acc[entity.url] = entity;
        return acc;
      },
      {},
    );
  }
}
