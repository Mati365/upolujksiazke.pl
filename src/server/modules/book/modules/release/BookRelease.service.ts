import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {BookReleaseEntity} from './BookRelease.entity';

@Injectable()
export class BookReleaseService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  create(dto: CreateBookReleaseDto): Promise<BookReleaseEntity> {
    return BookReleaseEntity.save(
      BookReleaseEntity.create(dto),
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {RemoteRecordDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  async upsert(dto: CreateBookReleaseDto, entityManager?: EntityManager): Promise<BookReleaseEntity> {
    const {connection} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookReleaseEntity,
        constraint: 'unique_publisher_isbn',
        data: new BookReleaseEntity(dto),
      },
    );
  }
}
