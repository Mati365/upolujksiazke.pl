import {Injectable, Inject, forwardRef} from '@nestjs/common';
import {Equal, Not} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {paginatedAsyncIterator} from '@server/common/helpers/db';
import {MemoizeMethod} from '@shared/helpers/decorators/ExpirableMemoizeMethod';

import {BookCategoryEntity} from '../BookCategory.entity';
import {BookCategoryService} from './BookCategory.service';
import {CreateBookCategoryDto} from '../dto/CreateBookCategory.dto';

@Injectable()
export class BookParentCategoryService {
  constructor(
    @Inject(forwardRef(() => BookCategoryService))
    private readonly categoryService: BookCategoryService,
  ) {}

  /**
   * Finds category that is assigned to products without category
   *
   * @return {Promise<CreateBookCategoryDto>}
   * @memberof BookParentCategoryService
   */
  @MemoizeMethod
  async findDefaultParentCategory(): Promise<CreateBookCategoryDto> {
    return this.categoryService.findSimilarCategory(
      {
        root: true,
        name: 'b.d',
      },
    );
  }

  /**
   * Lookups over category array and tries to assign category id to each
   *
   * @param {BookCategoryEntity[]} entities
   * @return {Promise<BookCategoryEntity[]>}
   * @memberof BookParentCategoryService
   */
  async findAndAssignParentCategories(entities: BookCategoryEntity[]): Promise<BookCategoryEntity[]> {
    const {categoryService} = this;

    return pMap(
      entities,
      async (dto) => {
        if (!R.isNil(dto.parentCategoryId))
          return dto;

        const matchedRootCategory = await categoryService.findSimilarCategory(
          {
            root: true,
            name: dto.name,
          },
        );

        if (!matchedRootCategory)
          return dto;

        return new BookCategoryEntity(
          {
            ...dto,
            parentCategoryId: matchedRootCategory?.id,
          },
        );
      },
      {
        concurrency: 2,
      },
    );
  }

  /**
   * Iterates over all categories and assigns to them
   * root category id
   *
   * @memberof BookParentCategoryService
   */
  async findAndAssignMissingParentCategories() {
    const {categoryService} = this;

    const defaultCategory = await this.findDefaultParentCategory();
    const categoriesIterator = paginatedAsyncIterator(
      {
        limit: 40,
        queryExecutor: ({limit, offset}) => (
          BookCategoryEntity
            .createQueryBuilder('c')
            .select(['c.id', 'c.name'])
            .offset(offset)
            .limit(limit)
            .where(
              {
                root: Not(Equal(true)),
              },
            )
            .orderBy('c.id', 'DESC')
            .getMany()
        ),
      },
    );

    for await (const [, categories] of categoriesIterator) {
      for await (const category of categories) {
        const matchedRootCategory = await categoryService.findSimilarCategory(
          {
            root: true,
            name: category.name,
          },
        );

        const parentCategoryId = matchedRootCategory?.id ?? defaultCategory?.id;
        if (!R.isNil(parentCategoryId)) {
          await BookCategoryEntity.update(
            category.id,
            {
              parentCategoryId,
            },
          );
        }
      }
    }
  }
}
