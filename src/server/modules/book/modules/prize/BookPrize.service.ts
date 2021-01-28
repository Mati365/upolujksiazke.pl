import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {BookPrizeEntity} from './BookPrize.entity';
import {CreateBookPrizeDto} from './dto/CreateBookPrize.dto';

@Injectable()
export class BookPrizeService {
  constructor(
    private readonly connection: Connection,
  ) {}

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
        primaryKey: 'name',
        data: dtos.map((dto) => new BookPrizeEntity(dto)),
      },
    );
  }
}
