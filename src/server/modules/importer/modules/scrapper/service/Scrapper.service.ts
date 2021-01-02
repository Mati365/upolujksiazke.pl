import * as R from 'ramda';
import {Injectable} from '@nestjs/common';

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

import {
  EIsbnScrappersGroup,
  LiteraturaGildiaScrappersGroup,
  WikipediaScrappersGroup,
  WykopScrappersGroup,
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
      new LiteraturaGildiaScrappersGroup(PARSERS_ENV.literaturaGildia),
      new WykopScrappersGroup(PARSERS_ENV.wykop),
      new WikipediaScrappersGroup(PARSERS_ENV.wikipedia),
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
        content: item,
        remote: new RemoteRecordEntity(
          {
            remoteId: R.toString(item.id),
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
