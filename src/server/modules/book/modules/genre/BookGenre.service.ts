import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {groupRawMany, upsert} from '@server/common/helpers/db';

import {CreateBookGenreDto} from './dto/CreateBookGenre.dto';
import {BookGenreEntity} from './BookGenre.entity';
import {BookGroupedSelectAttrs} from '../../shared/types';

@Injectable()
export class BookGenreService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Find many books with genres
   *
   * @param {BookGroupedSelectAttrs} attrs
   * @returns
   * @memberof BookGenreService
   */
  async findBooksGenres(
    {
      booksIds,
      select = [
        'g.id as "id"',
        'g.name as "name"',
        'g.parameterizedName as "parameterizedName"',
      ],
    }: BookGroupedSelectAttrs,
  ) {
    const items = await (
      BookGenreEntity
        .createQueryBuilder('g')
        .innerJoin(
          'book_genre_book_genre',
          'bg',
          'bg.bookId in (:...booksIds) and bg.bookGenreId = g.id',
          {
            booksIds,
          },
        )
        .select(
          [
            'bg.bookId as "bookId"',
            ...select,
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (item) => new BookGenreEntity(item),
      },
    );
  }

  /**
   * Find single book genre
   *
   * @param {number} bookId
   * @returns
   */
  async findBookGenre(bookId: number) {
    return (await this.findBooksGenres(
      {
        booksIds: [bookId],
      },
    ))[bookId] || [];
  }

  /**
   * Create single book genre
   *
   * @param {CreateBookGenreDto} dto
   * @returns {Promise<BookGenreEntity>}
   * @memberof BookGenreService
   */
  create(dto: CreateBookGenreDto): Promise<BookGenreEntity> {
    return BookGenreEntity.save(
      BookGenreEntity.create(dto),
    );
  }

  /**
   * Update multiple genres
   *
   * @param {CreateBookGenreDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookGenreEntity[]>}
   * @memberof BookGenreService
   */
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
