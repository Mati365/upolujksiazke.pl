import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {BookSeriesEntity} from './BookSeries.entity';
import {CreateBookSeriesDto} from './dto/CreateBookSeries.dto';

@Injectable()
export class BookSeriesService {
  constructor(
    private readonly connection: Connection,
  ) {}

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
        primaryKey: 'name',
        data: dtos.map((dto) => new BookSeriesEntity(dto)),
      },
    );
  }
}
