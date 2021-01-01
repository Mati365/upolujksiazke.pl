import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {RemoteEntityDto} from '../dto/RemoteEntity.dto';
import {ScrapperRemoteEntity} from '../entity';

@Injectable()
export class RemoteEntityService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Inserts or updates remote entity
   *
   * @param {RemoteEntityDto} dto
   * @returns {Promise<ScrapperRemoteEntity>}
   * @memberof RemoteEntityService
   */
  async upsert(dto: RemoteEntityDto): Promise<ScrapperRemoteEntity> {
    const {connection} = this;

    return upsert(
      {
        connection,
        Entity: ScrapperRemoteEntity,
        constraint: 'unique_remote_entry',
        data: new ScrapperRemoteEntity(dto),
      },
    );
  }
}
