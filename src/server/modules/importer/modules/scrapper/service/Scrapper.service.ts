import * as R from 'ramda';
import {Injectable} from '@nestjs/common';
import {classToPlain} from 'class-transformer';

import {SERVER_ENV} from '@server/constants/env';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {
  RemoteRecordEntity,
  RemoteWebsiteEntity,
} from '@server/modules/remote/entity';

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
  GraniceScrappersGroup,
  // MatrasScrappersGroup,
  EIsbnScrappersGroup,
  // LiteraturaGildiaScrappersGroup,
  // WikipediaScrappersGroup,
  WykopScrappersGroup,
  // SkupszopScrappersGroup,
} from './scrappers';

const {parsers: PARSERS_ENV} = SERVER_ENV;

export type ScrapperAnalyzerStats = {
  updated: number,
  removed: number,
};

@Injectable()
export class ScrapperService {
  public readonly scrappersGroups: WebsiteScrappersGroup[] = null;

  constructor(tmpDirService: TmpDirService) {
    this.scrappersGroups = [
      // new LiteraturaGildiaScrappersGroup(PARSERS_ENV.literaturaGildia),
      // new SkupszopScrappersGroup(PARSERS_ENV.skupszop),
      new GraniceScrappersGroup(PARSERS_ENV.granice),
      // new MatrasScrappersGroup(PARSERS_ENV.matras),

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
        content: {
          ...item,
          dto: classToPlain(item.dto),
        },
        remote: new RemoteRecordEntity(
          {
            remoteId: R.toString(item.remoteId),
            websiteId: website.id,
          },
        ),
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
    return R.find(
      (scrapper) => scrapper.websiteURL === url,
      this.scrappersGroups,
    );
  }
}
