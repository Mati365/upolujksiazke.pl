import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {upsert} from '@server/common/helpers/db';

import {BookSeriesEntity} from '../BookSeries.entity';
import {CreateBookSeriesDto} from '../dto/CreateBookSeries.dto';

@Injectable()
export class BookSeriesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly connection: Connection,
  ) {}

  /**
   * Returns all series for specific book
   *
   * @param {number} bookId
   * @returns
   * @memberof BookSeriesService
   */
  findBookSeries(bookId: number) {
    return (
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
        .getMany()
    );
  }

  /**
   * Removes series without any book
   *
   * @param {number[]} ids
   * @param {EntityManager} entityManager
   * @memberof BookSeriesService
   */
  async deleteOrphanedSeries(
    ids: number[],
    entityManager: EntityManager = this.entityManager,
  ) {
    await entityManager.query(
      /* sql */ `
        select bs."id"
        from book_series as "bs"
        where
          bs."id" = any(string_to_array($1, ',')::int[])
          and  (
            select count("bookId")
            from book_series_book_series as "bss"
            where bss."bookId" = bs."id"
          ) = 0
      `,
      [
        ids.join(','),
      ],
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
