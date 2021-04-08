import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {CreateBookEraDto} from './dto/CreateBookEra.dto';
import {BookEraEntity} from './BookEra.entity';

@Injectable()
export class BookEraService {
  constructor(
    private readonly connection: Connection,
  ) {}

  create(dto: CreateBookEraDto): Promise<BookEraEntity> {
    return BookEraEntity.save(
      BookEraEntity.create(dto),
    );
  }

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
