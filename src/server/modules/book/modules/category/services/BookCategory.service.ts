import {Injectable, Inject, forwardRef} from '@nestjs/common';
import {Connection, EntityManager, In} from 'typeorm';
import * as R from 'ramda';
import esb from 'elastic-builder';

import {
  safePluckIds,
  uniqFlatHashByProp,
} from '@shared/helpers';

import {
  BasicLimitPaginationOptions,
  PredefinedEntityDbIterator,
  IdMappedEntityDbIterator,
  createDbIteratedQuery,
  forwardTransaction,
  groupRawMany,
  runInPostHookIfPresent,
  upsert,
} from '@server/common/helpers/db';

import {ID} from '@shared/types';
import {CategoriesFindOneAttrs} from '@api/repo';

import {parameterize} from '@shared/helpers/parameterize';

import {BookGroupedSelectAttrs} from '@server/modules/book/shared/types';
import {BookCategoryEntity} from '../BookCategory.entity';
import {CreateBookCategoryDto} from '../dto/CreateBookCategory.dto';
import {EsBookCategoryIndex} from '../indices/EsBookCategory.index';
import {BookParentCategoryService} from './BookParentCategory.service';

@Injectable()
export class BookCategoryService {
  public static readonly BOOK_CATEGORY_FIELDS = [
    'c.id', 'c.name', 'c.parameterizedName',
    'c.promotion', 'c.icon', 'c.root',
  ];

  constructor(
    private readonly connection: Connection,
    private readonly categoryIndex: EsBookCategoryIndex,

    @Inject(forwardRef(() => BookParentCategoryService))
    private readonly parentCategoryService: BookParentCategoryService,
  ) {}

  /**
   * Return most similar category by name
   *
   * @param {Object} attrs
   * @returns {Promise<CreateBookCategoryDto>}
   * @memberof BookCategoryService
   */
  async findSimilarCategory(
    {
      name,
      root,
      excludeIds,
    }: {
      name: string,
      root?: boolean,
      excludeIds?: number[],
    },
  ): Promise<CreateBookCategoryDto> {
    const {categoryIndex} = this;
    let query = (
      esb
        .boolQuery()
        .must(
          esb
            .multiMatchQuery(
              ['name', 'nameAliases'],
              name,
            )
            .fuzziness('auto'),
        )
    );

    if (!R.isNil(root)) {
      query = query.filter(
        esb.termQuery('root', root),
      );
    }

    if (excludeIds) {
      query = query.mustNot(
        esb.idsQuery('values', excludeIds),
      );
    }

    const hits = await categoryIndex.searchHits(
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
   * Finds one category entity
   *
   * @param {ID} id
   * @param {CategoriesFindOneAttrs} [{root}={}]
   * @returns
   * @memberof BookCategoryService
   */
  findOne(id: ID, {root}: CategoriesFindOneAttrs = {}) {
    return BookCategoryEntity.findOne(
      id,
      {
        ...!R.isNil(root) && {
          where: {
            root,
          },
        },
      },
    );
  }

  /**
   * Creates iterator that walks over Categories table
   *
   * @template R
   * @param {PredefinedEntityDbIterator<BookAuthorEntity, R>} attrs
   * @memberof BookAuthorService
   */
  createIteratedQuery<R>(attrs: PredefinedEntityDbIterator<BookCategoryEntity, R>) {
    return createDbIteratedQuery(
      {
        prefix: 'c',
        query: (
          BookCategoryEntity.createQueryBuilder('c')
        ),
        ...attrs,
      },
    );
  }

  /**
   * Create query that iterates over all categories
   *
   * @param {IdMappedEntityDbIterator<BookCategoryEntity>} attrs
   * @returns
   * @memberof CardBookSearchService
   */
  createIdsIteratedQuery(attrs: IdMappedEntityDbIterator<BookCategoryEntity>) {
    return this.createIteratedQuery(
      {
        ...attrs,
        mapperFn: (result) => R.pluck('id', result),
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
        .andWhere('c.promotion > 0')
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
        'c.root as "root"',
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
   * Sets root flags to dtos, used for detect if book
   * assigned root categories to sub categories
   *
   * @param {CreateBookCategoryDto[]} dtos
   * @memberof BookCategoryService
   */
  async findAndAssignRootFlags(dtos: CreateBookCategoryDto[]) {
    if (!dtos?.length)
      return [];

    const mappedDtos = dtos.map(
      (dto) => new CreateBookCategoryDto(
        {
          ...dto,
          parameterizedName: parameterize(dto.name),
        },
      ),
    );

    const matchingRoots = uniqFlatHashByProp('parameterizedName', await BookCategoryEntity.find(
      {
        select: ['id', 'parameterizedName', 'root'],
        where: {
          parameterizedName: In(R.pluck('parameterizedName', mappedDtos)),
          root: true,
        },
      },
    ));

    return mappedDtos.map((dto) => {
      const rootCategory = matchingRoots[dto.parameterizedName];
      if (!rootCategory)
        return dto;

      return new CreateBookCategoryDto(
        {
          ...dto,
          ...rootCategory,
        },
      );
    });
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

    const {
      connection,
      categoryIndex,
      parentCategoryService,
    } = this;

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
        data: await parentCategoryService.findAndAssignParentCategories(uniqueDtos),
      },
    );

    if (result?.length) {
      await runInPostHookIfPresent(
        {
          transactionManager: entityManager,
        },
        () => categoryIndex.reindexBulk(safePluckIds(result)),
      );
    }

    return result;
  }
}
