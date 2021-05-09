import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {safePluckIds} from '@shared/helpers/safePluckIds';
import {paginatedAsyncIterator, PaginationForwardIteratorAttrs} from '@server/common/helpers/db/paginatedAsyncIterator';

import {BasicLimitPaginationOptions, forwardTransaction, groupRawMany, upsert} from '@server/common/helpers/db';
import {parameterize} from '@shared/helpers/parameterize';

import {BookGroupedSelectAttrs} from '@server/modules/book/shared/types';
import {BookCategoryEntity} from '../BookCategory.entity';
import {CreateBookCategoryDto} from '../dto/CreateBookCategory.dto';
import {EsBookCategoryIndex} from '../indices/EsBookCategory.index';

@Injectable()
export class BookCategoryService {
  public static readonly BOOK_CATEGORY_FIELDS = [
    'c.id', 'c.name', 'c.parameterizedName', 'c.promotion',
  ];

  constructor(
    private readonly connection: Connection,
    private readonly categoryIndex: EsBookCategoryIndex,
  ) {}

  /**
   * Create query that iterates over all categories
   *
   * @param {Object} attrs
   * @returns
   * @memberof BookCategoryService
   */
  createIdsIteratedQuery(
    {
      pageLimit,
      maxOffset = Infinity,
      query = (
        BookCategoryEntity.createQueryBuilder('c')
      ),
    }: PaginationForwardIteratorAttrs<BookCategoryEntity>,
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
   * Returns N most popular categories
   *
   * @param {Object} attrs
   * @returns
   * @memberof BookCategoryService
   */
  findMostPopularCategories(
    {
      limit,
      offset,
      ids,
      root,
    }: BasicLimitPaginationOptions & {
      ids?: number[],
      root?: boolean,
    },
  ) {
    if (ids && R.isEmpty(ids))
      return [];

    let qb = (
      BookCategoryEntity
        .createQueryBuilder('c')
        .select(BookCategoryService.BOOK_CATEGORY_FIELDS)
        .andWhere('c.promotion is not null')
        .orderBy('c.promotion', 'DESC')
    );

    if (!R.isNil(root))
      qb = qb.andWhere('c.root = :root', {root});

    if (offset)
      qb = qb.offset(offset);

    if (limit)
      qb = qb.limit(limit);

    if (ids)
      qb = qb.andWhereInIds(ids);

    return qb.getMany();
  }

  /**
   * Find categories for multiple books
   *
   * @param {number[]} bookIds
   * @returns
   * @memberof BookEraService
   */
  async findBooksCategories(
    {
      booksIds,
      select = [
        'c.id as "id"',
        'c.name as "name"',
        'c.parameterizedName as "parameterizedName"',
        'c.promotion as "promotion"',
      ],
    }: BookGroupedSelectAttrs,
  ) {
    const items = await (
      BookCategoryEntity
        .createQueryBuilder('c')
        .innerJoin(
          'book_categories_book_category',
          'bc',
          'bc.bookId in (:...booksIds) and bc.bookCategoryId = c.id',
          {
            booksIds,
          },
        )
        .select(
          [
            'bc.bookId as "bookId"',
            ...select,
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (item) => new BookCategoryEntity(item),
      },
    );
  }

  /**
   * Find categories for books
   *
   * @param {number} bookId
   * @returns
   * @memberof BookCategoryService
   */
  async findBookCategories(bookId: number) {
    return (await this.findBooksCategories(
      {
        booksIds: [bookId],
      },
    ))[bookId] || [];
  }

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookCategoryEntity>}
   * @memberof BookCategoryService
   */
  create(dto: CreateBookCategoryDto): Promise<BookCategoryEntity> {
    return BookCategoryEntity.save(
      BookCategoryEntity.create(dto),
    );
  }

  /**
   * Removes categories by ids
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookCategoryService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    if (!ids?.length)
      return;

    const {connection, categoryIndex} = this;
    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      (transaction) => transaction.delete(BookCategoryEntity, ids),
    );

    await categoryIndex.deleteEntities(ids);
  }

  /**
   * Creates or updates books categories
   *
   * @param {CreateBookCategoryDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookCategoryEntity[]>}
   * @memberof BookCategoryService
   */
  async upsert(dtos: CreateBookCategoryDto[], entityManager?: EntityManager): Promise<BookCategoryEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection, categoryIndex} = this;
    const uniqueDtos = R.uniqBy(
      (dto) => parameterize(dto.name),
      R.unnest(dtos.filter(Boolean).map(
        (dto) => dto.name.split(/[,/]/).map(
          (name) => new BookCategoryEntity(
            {
              ...dto,
              name: name.trim(),
            },
          ),
        ),
      )),
    );

    const result = await upsert(
      {
        entityManager,
        connection,
        Entity: BookCategoryEntity,
        primaryKey: 'parameterizedName',
        data: uniqueDtos,
      },
    );

    if (result?.length)
      await categoryIndex.reindexBulk(safePluckIds(result));

    return result;
  }
}
