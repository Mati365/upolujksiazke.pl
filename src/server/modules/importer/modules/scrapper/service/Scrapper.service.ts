import * as R from 'ramda';
import {Injectable} from '@nestjs/common';
import {classToPlain} from 'class-transformer';

import {SERVER_ENV} from '@server/constants/env';
import {extractHostname} from '@shared/helpers/urlExtract';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity';

import {
  ScrapperMetadataEntity,
  ScrapperMetadataStatus,
} from '../entity';

import {
  WebsiteScrapperItemInfo,
  WebsiteScrappersGroup,
} from './shared';

import {WykopAPI} from './scrappers/wykop/api/WykopAPI';
import {
  // GraniceScrappersGroup,
  MatrasScrappersGroup,
  EIsbnScrappersGroup,
  // LiteraturaGildiaScrappersGroup,
  // WikipediaScrappersGroup,
  WykopScrappersGroup,
  // SkupszopScrappersGroup,
} from './scrappers';

import {WebsiteInfoScrapperService} from './WebsiteInfoScrapper.service';

const {parsers: PARSERS_ENV} = SERVER_ENV;

@Injectable()
export class ScrapperService {
  public readonly scrappersGroups: WebsiteScrappersGroup[] = null;

  constructor(
    private readonly websiteInfoService: WebsiteInfoScrapperService,
    tmpDirService: TmpDirService,
  ) {
    this.scrappersGroups = [
      // new LiteraturaGildiaScrappersGroup(PARSERS_ENV.literaturaGildia),
      // new SkupszopScrappersGroup(PARSERS_ENV.skupszop),
      // new MatrasScrappersGroup(PARSERS_ENV.matras),
      // new GraniceScrappersGroup(PARSERS_ENV.granice),
      new MatrasScrappersGroup(PARSERS_ENV.matras),
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
      new EIsbnScrappersGroup(
        {
          ...PARSERS_ENV.eisbn,
          tmp: {
            ...PARSERS_ENV.eisbn.tmp,
            dirService: tmpDirService,
          },
        },
      ),
    ];
  }

  /**
   * Wraps scrapper result into entity
   *
   * @static
   * @param {RemoteWebsiteEntity} website
   * @param {IdentifiedItem<RemoteID>} item
   * @param {ScrapperMetadataStatus} [status=ScrapperMetadataStatus.NEW]
   * @returns
   * @memberof ScrapperService
   */
  static scrapperResultToMetadataEntity(
    website: RemoteWebsiteEntity,
    item: WebsiteScrapperItemInfo,
    status: ScrapperMetadataStatus = ScrapperMetadataStatus.NEW,
  ) {
    return new ScrapperMetadataEntity(
      {
        status,
        remoteId: R.toString(item.remoteId),
        websiteId: website.id,
        content: {
          ...item,
          dto: classToPlain(item.dto),
        },
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
   * @param {string} url
   * @returns {Promise<RemoteWebsiteEntity>}
   * @memberof ScrapperService
   */
  findOrCreateWebsiteByUrl(url: string): Promise<RemoteWebsiteEntity> {
    return this.websiteInfoService.findOrCreateWebsiteEntity(
      this.getScrappersGroupByWebsiteURL(url).websiteInfoScrapper,
    );
  }
}
