import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {BookAuthorEntity} from './BookAuthor.entity';
import {CreateBookAuthorDto} from './dto/CreateBookAuthor.dto';

@Injectable()
export class BookAuthorService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Create single book author
   *
   * @param {CreateBookAuthorDto} dto
   * @returns {Promise<BookAuthorEntity>}
   * @memberof BookAuthorService
   */
  create(dto: CreateBookAuthorDto): Promise<BookAuthorEntity> {
    return BookAuthorEntity.save(
      BookAuthorEntity.create(dto),
    );
  }

  /**
   * Create or update array of books authors
   *
   * @param {CreateBookAuthorDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookAuthorEntity[]>}
   * @memberof BookAuthorService
   */
  async upsertList(dtos: CreateBookAuthorDto[], entityManager?: EntityManager): Promise<BookAuthorEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    return upsert(
      {
        connection,
        entityManager,
        Entity: BookAuthorEntity,
        primaryKey: 'name',
        data: dtos.map((dto) => new BookAuthorEntity(dto)),
      },
    );
  }
}
