import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {
  forwardTransaction,
  upsert,
} from '@server/common/helpers/db';

import {BookSeriesEntity} from '../BookSeries.entity';
import {CreateBookSeriesDto} from '../dto/CreateBookSeries.dto';

@Injectable()
export class BookSeriesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly connection: Connection,
  ) {}

  /**
   * Create query to find series
   *
   * @param {number} bookId
   * @param {boolean} [hierarchic]
   * @returns
   * @memberof BookSeriesService
   */
  createBookSeriesQuery(bookId: number, hierarchic?: boolean) {
    let qb = (
      BookSeriesEntity
        .createQueryBuilder('s')
        .innerJoin(
          'book_series_book_series',
          'bs', 'bs.bookId = :bookId and bs.bookSeriesId = s.id',
          {
            bookId,
          },
        )
        .select(['s.id', 's.name'])
    );

    if (hierarchic)
      qb = qb.andWhere('s.hierarchic = true');

    return qb;
  }

  /**
   * Returns all series for specific book
   *
   * @param {number} bookId
   * @param {boolean} [hierarchic]
   * @returns
   * @memberof BookSeriesService
   */
  findBookSeries(bookId: number, hierarchic?: boolean) {
    return this.createBookSeriesQuery(bookId, hierarchic).getMany();
  }

  /**
   * Delete series without books
   *
   * @param {number[]} ids
   * @param {number} [minBookCount=1]
   * @param {EntityManager} [entityManager=this.entityManager]
   * @memberof BookSeriesService
   */
  async deleteOrphanedSeries(
    ids: number[],
    minBookCount: number = 1,
    entityManager: EntityManager = this.entityManager,
  ) {
    await entityManager.query(
      /* sql */ `
        delete
        from book_series as "bs"
        where
          bs."id" = any(string_to_array($1, ',')::int[])
          and  (
            select count("bookId")
            from book_series_book_series as "bss"
            where bss."bookId" = bs."id"
          ) <= $2
      `,
      [
        ids.join(','),
        minBookCount,
      ],
    );
  }

  /**
   * Remove multiple series by ids
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookSeriesService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {connection} = this;

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      (transaction) => transaction.remove(
        ids.map((id) => new BookSeriesEntity(
          {
            id,
          },
        )),
      ),
    );
  }

  /**
   * Creates signle book volume
   *
   * @param {CreateBookSeriesDto} dto
   * @returns {Promise<BookSeriesEntity>}
   * @memberof BookVolumeService
   */
  create(dto: CreateBookSeriesDto): Promise<BookSeriesEntity> {
    return BookSeriesEntity.save(
      BookSeriesEntity.create(dto),
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateBookSeriesDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookSeriesEntity[]>}
   * @memberof BookVolumeService
   */
  async upsert(dtos: CreateBookSeriesDto[], entityManager?: EntityManager): Promise<BookSeriesEntity[]> {
    const {connection} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookSeriesEntity,
        primaryKey: 'parameterizedName',
        data: R.uniqBy(R.prop('name'), dtos).map(
          (dto) => new BookSeriesEntity(dto),
        ),
      },
    );
  }
}
