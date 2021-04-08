import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {CreateBookEraDto} from './dto/CreateBookEra.dto';
import {BookEraEntity} from './BookEra.entity';

@Injectable()
export class BookEraService {
  public static readonly BOOK_ERA_FIELDS = [
    'e.id', 'e.name', 'e.parameterizedName',
  ];

  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Find book era records
   *
   * @param {number} bookId
   * @returns
   * @memberof BookEraService
   */
  findBookEra(bookId: number) {
    return (
      BookEraEntity
        .createQueryBuilder('e')
        .innerJoin(
          'book_era_book_era',
          'be', 'be.bookId = :bookId and be.bookEraId = e.id',
          {
            bookId,
          },
        )
        .select(BookEraService.BOOK_ERA_FIELDS)
        .getMany()
    );
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
