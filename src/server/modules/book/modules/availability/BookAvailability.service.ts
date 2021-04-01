import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import pMap from 'p-map';

import {
  forwardTransaction,
  upsert,
} from '@server/common/helpers/db';

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
   * Remove multiple book availability
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager=<any> BookAvailabilityEntity]
   * @memberof BookAvailabilityService
   */
  async delete(
    ids: number[],
    entityManager: EntityManager = <any> BookAvailabilityEntity,
  ) {
    await entityManager.remove(
      ids.map(
        (id) => new BookAvailabilityEntity(
          {
            id,
          },
        ),
      ),
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
        constraint: 'book_availability_unique_remote_website',
        Entity: BookAvailabilityEntity,
        data: new BookAvailabilityEntity(dto),
      },
    );
  }

  /**
   * Create or update array of books
   *
   * @param {CreateBookAvailabilityDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookAvailabilityEntity[]>}
   * @memberof BookAvailabilityService
   */
  async upsertList(
    dtos: CreateBookAvailabilityDto[],
    entityManager?: EntityManager,
  ): Promise<BookAvailabilityEntity[]> {
    if (!dtos?.length)
      return [];

    // do not use Promise.all! It breaks typeorm!
    return forwardTransaction(
      {
        connection: this.connection,
        entityManager,
      },
      () => pMap(
        dtos,
        (item) => this.upsert(item, entityManager),
        {
          concurrency: 1,
        },
      ),
    );
  }
}
