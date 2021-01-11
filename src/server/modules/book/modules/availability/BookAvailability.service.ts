import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {BookAvailabilityEntity} from './BookAvailability.entity';
import {CreateBookAvailabilityDto} from './dto/CreateBookAvailability.dto';

@Injectable()
export class BookAvailabilityService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookAvailabilityEntity>}
   * @memberof BookAvailabilityService
   */
  create(dto: CreateBookAvailabilityDto): Promise<BookAvailabilityEntity> {
    return BookAvailabilityEntity.save(
      BookAvailabilityEntity.create(dto),
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateBookAvailabilityDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookAvailabilityEntity>}
   * @memberof BookAvailabilityService
   */
  async upsert(dto: CreateBookAvailabilityDto, entityManager?: EntityManager): Promise<BookAvailabilityEntity> {
    const {connection} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookAvailabilityEntity,
        constraint: 'remote_record_unique_remote_entry',
        data: new BookAvailabilityEntity(dto),
      },
    );
  }
}
