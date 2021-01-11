import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {CreateRemoteRecordDto} from '../dto/CreateRemoteRecord.dto';
import {RemoteRecordEntity} from '../entity';

@Injectable()
export class RemoteRecordService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateRemoteRecordDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<RemoteRecordEntity>}
   * @memberof RemoteEntityService
   */
  async upsert(dto: CreateRemoteRecordDto, entityManager?: EntityManager): Promise<RemoteRecordEntity> {
    const {connection} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: RemoteRecordEntity,
        constraint: 'remote_record_unique_remote_entry',
        data: new RemoteRecordEntity(dto),
      },
    );
  }
}
