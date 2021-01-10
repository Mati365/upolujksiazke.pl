import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {BookCategoryEntity} from './BookCategory.entity';
import {CreateBookCategoryDto} from './dto/CreateBookCategory.dto';

@Injectable()
export class BookCategoryService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookCategoryEntity>}
   * @memberof BookCategoryService
   */
  create(dto: CreateBookCategoryDto): Promise<BookCategoryEntity> {
    return BookCategoryEntity.save(
      BookCategoryEntity.create(dto),
    );
  }

  /**
   * Creates or updates books categories
   *
   * @param {CreateBookCategoryDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookCategoryEntity[]>}
   * @memberof BookCategoryService
   */
  async upsertList(dtos: CreateBookCategoryDto[], entityManager?: EntityManager): Promise<BookCategoryEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    return upsert(
      {
        entityManager,
        connection,
        Entity: BookCategoryEntity,
        primaryKey: 'name',
        data: dtos.map((dto) => new BookCategoryEntity(dto)),
      },
    );
  }
}
