import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {upsert} from '@server/common/helpers/db';
import {parameterize} from '@shared/helpers/parameterize';

import {BookCategoryEntity} from '../BookCategory.entity';
import {CreateBookCategoryDto} from '../dto/CreateBookCategory.dto';

@Injectable()
export class BookCategoryService {
  public static readonly BOOK_CATEGORY_FIELDS = [
    'c.id', 'c.name', 'c.parameterizedName',
  ];

  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Returns N most popular categories
   *
   * @param {number} limit
   * @returns
   * @memberof BookCategoryService
   */
  findMostPopularCategories(limit: number) {
    return (
      BookCategoryEntity
        .createQueryBuilder('c')
        .select(BookCategoryService.BOOK_CATEGORY_FIELDS)
        .limit(limit)
        .orderBy('c.promotion', 'DESC')
        .getMany()
    );
  }

  /**
   * Find categories for books
   *
   * @param {number} bookId
   * @returns
   * @memberof BookCategoryService
   */
  findBookCategories(bookId: number) {
    return (
      BookCategoryEntity
        .createQueryBuilder('c')
        .innerJoin(
          'book_categories_book_category',
          'bc', 'bc.bookId = :bookId and bc.bookCategoryId = c.id',
          {
            bookId,
          },
        )
        .select(BookCategoryService.BOOK_CATEGORY_FIELDS)
        .getMany()
    );
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
