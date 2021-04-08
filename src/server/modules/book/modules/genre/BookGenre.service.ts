import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {CreateBookGenreDto} from './dto/CreateBookGenre.dto';
import {BookGenreEntity} from './BookGenre.entity';

@Injectable()
export class BookGenreService {
  constructor(
    private readonly connection: Connection,
  ) {}

  create(dto: CreateBookGenreDto): Promise<BookGenreEntity> {
    return BookGenreEntity.save(
      BookGenreEntity.create(dto),
    );
  }

  async upsert(dtos: CreateBookGenreDto[], entityManager?: EntityManager): Promise<BookGenreEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    const records = dtos.map((dto) => new BookGenreEntity(dto));

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookGenreEntity,
        primaryKey: 'parameterizedName',
        data: records,
      },
    );
  }
}
