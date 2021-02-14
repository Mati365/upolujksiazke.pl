import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {ID} from '@shared/types';

import {upsert} from '@server/common/helpers/db';
import {extractPathname} from '@shared/helpers/urlExtract';

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
        doNothing: true,
        constraint: 'spider_queue_unique_website_path',
        data: dtos.map((dto) => new SpiderQueueEntity(dto)),
      },
    );
  }

  /**
   * Get start spider address
   *
   * @see {@link https://github.com/typeorm/typeorm/pull/7282}
   *
   * @param {ID} websiteId
   * @param {FindOneOptions<SpiderQueueEntity>} [options]
   * @returns
   * @memberof SpiderQueueService
   */
  async popFirstNotProcessedEntity(websiteId: ID) {
    const qb = SpiderQueueEntity.createQueryBuilder();
    const subQuery = `${R.init(
      qb
        .subQuery()
        .where('sortedItem.processed = :processed and sortedItem.websiteId = :websiteId')
        .orderBy(
          {
            priority: 'DESC',
            createdAt: 'DESC',
          },
        )
        .from(SpiderQueueEntity, 'sortedItem')
        .select('id')
        .limit(1)
        .getQuery(),
    )} FOR UPDATE SKIP LOCKED)`;

    const result = await (
      qb
        .update(SpiderQueueEntity)
        .set(
          {
            processed: true,
          },
        )
        .where(`id = ${subQuery}`)
        .setParameters(
          {
            processed: false,
            websiteId,
          },
        )
        .returning('*')
        .execute()
    );

    const rawItem = result?.raw?.[0];
    if (!rawItem)
      return null;

    return new SpiderQueueEntity(rawItem);
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
          remoteId: extractPathname(url),
          websiteId,
        },
      },
    );

    return !!metadata;
  }
}
