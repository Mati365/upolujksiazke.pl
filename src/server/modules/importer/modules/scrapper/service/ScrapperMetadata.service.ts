import {Injectable} from '@nestjs/common';

import {classToPlain} from 'class-transformer';
import {safeToString} from '@shared/helpers';

import {RemoteWebsiteEntity} from '@server/modules/remote/entity/RemoteWebsite.entity';
import {WebsiteScrapperItemInfo} from './shared/AsyncScrapper';
import {
  ScrapperMetadataEntity,
  ScrapperMetadataKind,
  ScrapperMetadataStatus,
} from '../entity';

@Injectable()
export class ScrapperMetadataService {
  /**
   * Wraps scrapper result into entity
   *
   * @static
   * @param {RemoteWebsiteEntity} website
   * @param {IdentifiedItem<RemoteID>} item
   * @param {ScrapperMetadataStatus} [status=ScrapperMetadataStatus.IMPORTED]
   * @returns
   * @memberof ScrapperMetadataService
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
   * Creates inactive items url query
   *
   * @returns
   * @memberof ScrapperMetadataService
   */
  createInactiveQuery() {
    return (
      ScrapperMetadataEntity
        .createQueryBuilder()
        .where(
          'kind != :kind and content is NULL',
          {
            kind: ScrapperMetadataKind.URL,
          },
        )
    );
  }

  /**
   * Performs count and deletes inactive items
   *
   * @returns
   * @memberof ScrapperMetadataService
   */
  async deleteAndCountDeleted() {
    const count = await this.createInactiveQuery().getCount();

    await this.createInactiveQuery().delete().execute();
    return count;
  }
}
