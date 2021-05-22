import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import pMap from 'p-map';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {
  PaginationResult,
  PaginationForwardIteratorAttrs,
  groupRawMany,
  upsert,
  paginatedAsyncIterator,
  forwardTransaction,
} from '@server/common/helpers/db';

import {BooksAuthorsFilters} from '@api/repo';
import {BookGroupedSelectAttrs} from '../../shared/types';
import {BookAuthorEntity} from './BookAuthor.entity';
import {CreateBookAuthorDto} from './dto/CreateBookAuthor.dto';
import {EsBookAuthorIndex} from './indices/EsBookAuthor.index';
import {BookService} from '../../services/Book.service';

@Injectable()
export class BookAuthorService {
  constructor(
    private readonly connection: Connection,
    private readonly authorIndex: EsBookAuthorIndex,
    private readonly bookService: BookService,
  ) {}

  /**
   * Delete array of authors
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookAuthorService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      bookService,
      authorIndex,
    } = this;

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      async (transaction) => {
        const booksIds = R.pluck('bookId', await (
          transaction
            .createQueryBuilder()
            .from('book_authors_book_author', 'b')
            .select('b."bookId"')
            .where('b."bookAuthorId" in (:...ids)', {ids})
            .getRawMany()
        ));

        if (!R.isEmpty(booksIds))
          await bookService.delete(booksIds, transaction);

        await transaction.remove(
          ids.map((id) => new BookAuthorEntity(
            {
              id,
            },
          )),
        );
      },
    );

    await authorIndex.deleteEntities(ids);
  }

  /**
   * Create query that iterates over all authors
   *
   * @param {Object} attrs
   * @returns
   * @memberof BookAuthorService
   */
  createIdsIteratedQuery(
    {
      pageLimit,
      maxOffset = Infinity,
      query = (
        BookAuthorEntity.createQueryBuilder('c')
      ),
    }: PaginationForwardIteratorAttrs<BookAuthorEntity>,
  ) {
    return paginatedAsyncIterator(
      {
        maxOffset,
        limit: pageLimit,
        queryExecutor: async ({limit, offset}) => {
          const result = await (
            query
              .select('c.id')
              .offset(offset)
              .limit(limit)
              .orderBy('c.id', 'DESC')
              .getMany()
          );

          return R.pluck('id', result);
        },
      },
    );
  }

  /**
   * Return most similar authors by name
   *
   * @param {Object} attrs
   * @returns {Promise<CreateBookAuthorDto>}
   * @memberof BookAuthorService
   */
  async findSimilarAuthor(
    {
      name,
      excludeIds,
    }: {
      name: string,
      excludeIds?: number[],
    },
  ): Promise<CreateBookAuthorDto> {
    const {authorIndex} = this;
    let query = (
      esb
        .boolQuery()
        .must(
          esb
            .multiMatchQuery(
              ['name', 'nameAliases'],
              name,
            )
            .operator('and'),
        )
    );

    if (excludeIds) {
      query = query.mustNot(
        esb.idsQuery('values', excludeIds),
      );
    }

    const hits = await authorIndex.searchHits(
      esb
        .requestBodySearch()
        .source(['id', 'name', 'parameterizedName'])
        .query(query),
    );

    if (R.isEmpty(hits))
      return null;

    return hits[0]._source;
  }

  /**
   * Find single book by id
   *
   * @param {number} id
   * @returns
   * @memberof BookAuthorService
   */
  findOne(id: number) {
    return BookAuthorEntity.findOne(id);
  }

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

  /**
   * Iterates over all dtos and try to merge aliases
   *
   * @param {CreateBookAuthorDto[]} dtos
   * @memberof BookAuthorService
   */
  async mergeAliasedDtos(dtos: CreateBookAuthorDto[]) {
    return pMap(
      dtos,
      async (dto) => {
        const similarAuthor = await this.findSimilarAuthor(
          {
            name: dto.name,
          },
        );

        return similarAuthor ?? dto;
      },
      {
        concurrency: 2,
      },
    );
  }
}
