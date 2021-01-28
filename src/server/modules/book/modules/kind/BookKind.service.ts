import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {BookKindEntity} from './BookKind.entity';
import {CreateBookKindDto} from './dto/CreateBookKind.dto';

@Injectable()
export class BookKindService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates signle book category
   *
   * @param {CreateBookKindDto} dto
   * @returns {Promise<BookKindEntity>}
   * @memberof BookKindService
   */
  create(dto: CreateBookKindDto): Promise<BookKindEntity> {
    return BookKindEntity.save(
      BookKindEntity.create(dto),
    );
  }

  /**
   * Creates or updates books categories
   *
   * @param {CreateBookKindDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookKindEntity[]>}
   * @memberof BookKindService
   */
  async upsertList(dtos: CreateBookKindDto[], entityManager?: EntityManager): Promise<BookKindEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    return upsert(
      {
        entityManager,
        connection,
        Entity: BookKindEntity,
        primaryKey: 'name',
        data: dtos.map((dto) => new BookKindEntity(dto)),
      },
    );
  }
}
