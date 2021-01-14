import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {BookVolumeEntity} from './BookVolume.entity';
import {CreateBookVolumeDto} from './dto/CreateBookVolume.dto';

@Injectable()
export class BookVolumeService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates signle book volume
   *
   * @param {CreateBookVolumeDto} dto
   * @returns {Promise<BookVolumeEntity>}
   * @memberof BookAvailabilityService
   */
  create(dto: CreateBookVolumeDto): Promise<BookVolumeEntity> {
    return BookVolumeEntity.save(
      BookVolumeEntity.create(dto),
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateBookVolumeDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookVolumeEntity>}
   * @memberof BookAvailabilityService
   */
  async upsert(dto: CreateBookVolumeDto, entityManager?: EntityManager): Promise<BookVolumeEntity> {
    const {connection} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookVolumeEntity,
        primaryKey: 'name',
        data: new BookVolumeEntity(dto),
      },
    );
  }
}
