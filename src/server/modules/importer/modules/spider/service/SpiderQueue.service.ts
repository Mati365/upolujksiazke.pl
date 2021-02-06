import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {ID} from '@shared/types';

import {upsert} from '@server/common/helpers/db';
import {extractPathname} from '@shared/helpers/urlExtract';

import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';

import {SpiderQueueEntity} from '../entity/SpiderQueue.entity';
import {CreateSpiderQueueDto} from '../dto/CreateSpiderQueue.dto';

@Injectable()
export class SpiderQueueService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Create or update SpiderQueueEntity
   *
   * @param {CreateSpiderQueueDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<SpiderQueueEntity[]>}
   * @memberof SpiderQueueService
   */
  async upsert(dtos: CreateSpiderQueueDto[], entityManager?: EntityManager): Promise<SpiderQueueEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    return upsert(
      {
        entityManager,
        connection,
        Entity: SpiderQueueEntity,
        primaryKey: 'path',
        data: dtos.map((dto) => new SpiderQueueEntity(dto)),
      },
    );
  }

  /**
   * Get start spider address
   *
   * @param {ID} websiteId
   * @returns
   * @memberof SpiderQueueService
   */
  async getFirstNotProcessedEntity(websiteId: ID) {
    return SpiderQueueEntity.findOne(
      {
        order: {
          createdAt: 'DESC',
        },
        where: {
          kind: ScrapperMetadataKind.URL,
          processed: false,
          websiteId,
        },
      },
    );
  }

  /**
   * Checks if spider already checked url
   *
   * @param {ID} websiteId
   * @param {string} url
   * @returns
   * @memberof SpiderQueueService
   */
  async isURLAlreadyStored(websiteId: ID, url: string) {
    const metadata = await SpiderQueueEntity.findOne(
      {
        select: ['id'],
        where: {
          kind: ScrapperMetadataKind.URL,
          remoteId: extractPathname(url),
          websiteId,
        },
      },
    );

    return !!metadata;
  }
}
