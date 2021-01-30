import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

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
  async upsert(dtos: CreateBookCategoryDto[], entityManager?: EntityManager): Promise<BookCategoryEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    const uniqueDtos = R.uniq(R.unnest(dtos.map(
      (dto) => dto.name.split(/[,/]/).map(
        (name) => new BookCategoryEntity(
          {
            ...dto,
            name: name.trim(),
          },
        ),
      ),
    )));

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookCategoryEntity,
        primaryKey: 'parameterizedName',
        data: uniqueDtos,
      },
    );
  }
}
