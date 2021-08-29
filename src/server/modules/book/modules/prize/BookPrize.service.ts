import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {groupRawMany, upsert} from '@server/common/helpers/db';

import {BookPrizeEntity} from './BookPrize.entity';
import {BookGroupedSelectAttrs} from '../../shared/types';
import {CreateBookPrizeDto} from './dto/CreateBookPrize.dto';

@Injectable()
export class BookPrizeService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Find many book prizes ids
   *
   * @param {BookGroupedSelectAttrs} attrs
   * @returns
   * @memberof BookPrizeService
   */
  async findBooksPrizes(
    {
      booksIds,
      select = [
        'b.id as "id"',
        'b.name as "name"',
        'b.parameterizedName as "parameterizedName"',
      ],
    }: BookGroupedSelectAttrs,
  ) {
    const items = await (
      BookPrizeEntity
        .createQueryBuilder('b')
        .innerJoin(
          'book_prizes_book_prize',
          'bp',
          'bp.bookId in (:...booksIds) and bp.bookPrizeId = b.id',
          {
            booksIds,
          },
        )
        .select(
          [
            'bp.bookId as "bookId"',
            ...select,
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (item) => new BookPrizeEntity(item),
      },
    );
  }

  /**
   * Find prizes for books
   *
   * @param {number} bookId
   * @returns
   * @memberof BookPrizeService
   */
  async findBookPrizes(bookId: number) {
    return (await this.findBooksPrizes(
      {
        booksIds: [bookId],
      },
    ))[bookId] || [];
  }

  /**
   * Creates signle book category
   *
   * @param {CreateBookPrizeDto} dto
   * @returns {Promise<BookPrizeEntity>}
   * @memberof BookPrizeService
   */
  create(dto: CreateBookPrizeDto): Promise<BookPrizeEntity> {
    return BookPrizeEntity.save(
      BookPrizeEntity.create(dto),
    );
  }

  /**
   * Creates or updates books categories
   *
   * @param {CreateBookPrizeDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookPrizeEntity[]>}
   * @memberof BookPrizeService
   */
  async upsert(dtos: CreateBookPrizeDto[], entityManager?: EntityManager): Promise<BookPrizeEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    return upsert(
      {
        entityManager,
        connection,
        Entity: BookPrizeEntity,
        primaryKey: 'parameterizedName',
        data: dtos.map((dto) => new BookPrizeEntity(dto)),
      },
    );
  }
}
