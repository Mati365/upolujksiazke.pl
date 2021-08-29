import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {groupRawMany, upsert} from '@server/common/helpers/db';

import {CreateBookEraDto} from './dto/CreateBookEra.dto';
import {BookEraEntity} from './BookEra.entity';
import {BookGroupedSelectAttrs} from '../../shared/types';

@Injectable()
export class BookEraService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Find eras for multiple books
   *
   * @param {BookGroupedSelectAttrs} attrs
   * @returns
   * @memberof BookEraService
   */
  async findBooksEras(
    {
      booksIds,
      select = [
        'e.id as "id"',
        'e.name as "name"',
        'e.parameterizedName as "parameterizedName"',
      ],
    }: BookGroupedSelectAttrs,
  ) {
    const items = await (
      BookEraEntity
        .createQueryBuilder('e')
        .innerJoin(
          'book_era_book_era',
          'be',
          'be.bookId in (:...booksIds) and be.bookEraId = e.id',
          {
            booksIds,
          },
        )
        .select(
          [
            'be.bookId as "bookId"',
            ...select,
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (item) => new BookEraEntity(item),
      },
    );
  }

  /**
   * Find book era records
   *
   * @param {number} bookId
   * @returns
   * @memberof BookEraService
   */
  async findBookEra(bookId: number) {
    return (await this.findBooksEras(
      {
        booksIds: [bookId],
      },
    ))[bookId] || [];
  }

  /**
   * Create book era
   *
   * @param {CreateBookEraDto} dto
   * @returns {Promise<BookEraEntity>}
   * @memberof BookEraService
   */
  create(dto: CreateBookEraDto): Promise<BookEraEntity> {
    return BookEraEntity.save(
      BookEraEntity.create(dto),
    );
  }

  /**
   * Update book era
   *
   * @param {CreateBookEraDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookEraEntity[]>}
   * @memberof BookEraService
   */
  async upsert(dtos: CreateBookEraDto[], entityManager?: EntityManager): Promise<BookEraEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    const records = dtos.map((dto) => new BookEraEntity(dto));

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookEraEntity,
        primaryKey: 'parameterizedName',
        data: records,
      },
    );
  }
}
