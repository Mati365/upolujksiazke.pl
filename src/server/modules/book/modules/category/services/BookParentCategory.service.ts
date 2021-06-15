import {Injectable} from '@nestjs/common';
import {Equal, Not} from 'typeorm';
import * as R from 'ramda';

import {paginatedAsyncIterator} from '@server/common/helpers/db';
import {BookCategoryEntity} from '../BookCategory.entity';
import {BookCategoryService} from './BookCategory.service';
import {CreateBookCategoryDto} from '../dto/CreateBookCategory.dto';

@Injectable()
export class BookParentCategoryService {
  constructor(
    private readonly categoryService: BookCategoryService,
  ) {}

  /**
   * Finds category that is assigned to products without category
   *
   * @return {Promise<CreateBookCategoryDto>}
   * @memberof BookParentCategoryService
   */
  async findDefaultParentCategory(): Promise<CreateBookCategoryDto> {
    return this.categoryService.findSimilarCategory(
      {
        root: true,
        name: 'b.d',
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

    const otherCategory = await this.findDefaultParentCategory();

    for await (const [, categories] of categoriesIterator) {
      for await (const category of categories) {
        const matchedRootCategory = await categoryService.findSimilarCategory(
          {
            root: true,
            name: category.name,
          },
        );

        const parentCategoryId = matchedRootCategory?.id ?? otherCategory?.id;
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
