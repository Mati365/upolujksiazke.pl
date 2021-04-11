import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {BasicLimitPaginationOptions, groupRawMany, upsert} from '@server/common/helpers/db';
import {parameterize} from '@shared/helpers/parameterize';

import {BookCategoryEntity} from '../BookCategory.entity';
import {CreateBookCategoryDto} from '../dto/CreateBookCategory.dto';

@Injectable()
export class BookCategoryService {
  public static readonly BOOK_CATEGORY_FIELDS = [
    'c.id', 'c.name', 'c.parameterizedName', 'c.promotion',
  ];

  constructor(
    private readonly connection: Connection,
  ) {}

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
    }: BasicLimitPaginationOptions & {
      ids?: number[],
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
  async findBooksCategories(bookIds: number[]) {
    const items = await (
      BookCategoryEntity
        .createQueryBuilder('c')
        .innerJoin(
          'book_categories_book_category',
          'bc',
          'bc.bookId in (:...bookIds) and bc.bookCategoryId = c.id',
          {
            bookIds,
          },
        )
        .select(
          [
            'c.id as "id"',
            'c.name as "name"',
            'c.parameterizedName as "parameterizedName"',
            'c.promotion as "promotion"',
            'bc.bookId as "bookId"',
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
    return (await this.findBooksCategories([bookId]))[bookId];
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

    const {connection} = this;
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

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookCategoryEntity,
        primaryKey: 'parameterizedName',
        data: uniqueDtos,
      },
    );
  }
}
