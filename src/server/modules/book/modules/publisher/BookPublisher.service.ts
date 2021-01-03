import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {BookPublisherEntity} from './BookPublisher.entity';
import {CreateBookPublisherDto} from './dto/BookPublisher.dto';

@Injectable()
export class BookPublisherService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookPublisherEntity>}
   * @memberof BookPublisherService
   */
  create(dto: CreateBookPublisherDto): Promise<BookPublisherEntity> {
    return BookPublisherEntity.save(
      BookPublisherEntity.create(dto),
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateRemoteRecordDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookPublisherEntity>}
   * @memberof BookPublisherService
   */
  async upsert(dto: CreateBookPublisherDto, entityManager?: EntityManager): Promise<BookPublisherEntity> {
    const {connection} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookPublisherEntity,
        primaryKey: 'name',
        data: new BookPublisherEntity(dto),
      },
    );
  }
}
