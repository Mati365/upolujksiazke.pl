import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {CreateBookGenreDto} from './dto/CreateBookGenre.dto';
import {BookGenreEntity} from './BookGenre.entity';

@Injectable()
export class BookGenreService {
  public static readonly BOOK_GENRE_FIELDS = [
    'g.id', 'g.name', 'g.parameterizedName',
  ];

  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Find book genre records
   *
   * @param {number} bookId
   * @returns
   * @memberof BookGenreService
   */
  findBookGenre(bookId: number) {
    return (
      BookGenreEntity
        .createQueryBuilder('g')
        .innerJoin(
          'book_genre_book_genre',
          'bg', 'bg.bookId = :bookId and bg.bookGenreId = g.id',
          {
            bookId,
          },
        )
        .select(BookGenreService.BOOK_GENRE_FIELDS)
        .getMany()
    );
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
