import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {
  PaginationResult,
  groupRawMany,
  upsert,
} from '@server/common/helpers/db';

import {BooksAuthorsFilters} from '@api/repo';
import {BookGroupedSelectAttrs} from '../../shared/types';
import {BookAuthorEntity} from './BookAuthor.entity';
import {CreateBookAuthorDto} from './dto/CreateBookAuthor.dto';

@Injectable()
export class BookAuthorService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Find all first authors letters
   *
   * @returns
   * @memberof BookAuthorService
   */
  async findAuthorsFirstNamesLetters() {
    const results = await (
      BookAuthorEntity
        .createQueryBuilder()
        .select(['upper(substr("name", 1, 1)) as alpha'])
        .groupBy('alpha')
        .orderBy('alpha')
        .getRawMany()
    );

    return R.pluck('alpha', results);
  }

  /**
   * Find all authors that names starts with
   *
   * @param {BooksAuthorsFilters} [filters={}]
   * @returns {Promise<PaginationResult<BookAuthorEntity>>}
   * @memberof BookAuthorService
   */
  async findFilteredAuthors(filters: BooksAuthorsFilters = {}): Promise<PaginationResult<BookAuthorEntity>> {
    const {
      limit,
      offset,
      excludeIds,
      firstLetters,
    } = filters;

    let query = (
      BookAuthorEntity
        .createQueryBuilder()
    );

    if (filters.limit)
      query = query.limit(limit);

    if (filters.offset)
      query = query.offset(offset);

    if (excludeIds)
      query = query.andWhere('id not in (:...excludsIds)', {excludeIds});

    if (firstLetters)
      query = query.andWhere('upper(substr("name", 1, 1)) in (:...firstLetters)', {firstLetters});

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      meta: {
        totalItems: total,
        limit,
        offset,
      },
    };
  }

  /**
   * Find authors for multiple books
   *
   * @param {BookGroupedSelectAttrs} attrs
   * @returns
   * @memberof BookEraService
   */
  async findBooksAuthors(
    {
      booksIds,
      select = [
        'b.id as "id"',
        'b.name as "name"',
        'b.parameterizedName as "parameterizedName"',
      ],
    }: BookGroupedSelectAttrs,
  ) {
    const items = await (
      BookAuthorEntity
        .createQueryBuilder('b')
        .innerJoin(
          'book_authors_book_author',
          'ba',
          'ba.bookId in (:...booksIds) and ba.bookAuthorId = b.id',
          {
            booksIds,
          },
        )
        .select(
          [
            ...select,
            'ba.bookId as "bookId"',
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (item) => new BookAuthorEntity(item),
      },
    );
  }

  /**
   * Find authors for books
   *
   * @param {number} bookId
   * @returns
   * @memberof BookCategoryService
   */
  async findBookAuthors(bookId: number) {
    return (await this.findBooksAuthors(
      {
        booksIds: [bookId],
      },
    ))[bookId] || [];
  }

  /**
   * Create single book author
   *
   * @param {CreateBookAuthorDto} dto
   * @returns {Promise<BookAuthorEntity>}
   * @memberof BookAuthorService
   */
  create(dto: CreateBookAuthorDto): Promise<BookAuthorEntity> {
    return BookAuthorEntity.save(
      BookAuthorEntity.create(dto),
    );
  }

  /**
   * Create or update array of books authors
   *
   * @param {CreateBookAuthorDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookAuthorEntity[]>}
   * @memberof BookAuthorService
   */
  async upsert(dtos: CreateBookAuthorDto[], entityManager?: EntityManager): Promise<BookAuthorEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    return upsert(
      {
        connection,
        entityManager,
        Entity: BookAuthorEntity,
        primaryKey: 'parameterizedName',
        data: dtos.map((dto) => new BookAuthorEntity(dto)),
      },
    );
  }
}
