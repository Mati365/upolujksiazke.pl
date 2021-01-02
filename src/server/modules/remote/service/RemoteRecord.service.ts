import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {RemoteRecordDto} from '../dto/RemoteRecord.dto';
import {RemoteRecordEntity} from '../entity';

@Injectable()
export class RemoteRecordService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Inserts or updates remote entity
   *
   * @param {RemoteRecordDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<RemoteRecordEntity>}
   * @memberof RemoteEntityService
   */
  async upsert(dto: RemoteRecordDto, entityManager?: EntityManager): Promise<RemoteRecordEntity> {
    const {connection} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: RemoteRecordEntity,
        constraint: 'unique_remote_entry',
        data: new RemoteRecordEntity(dto),
      },
    );
  }
}
