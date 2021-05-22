import {Injectable} from '@nestjs/common';
import {Equal, Not} from 'typeorm';
import * as R from 'ramda';

import {paginatedAsyncIterator} from '@server/common/helpers/db';
import {BookCategoryEntity} from '../BookCategory.entity';
import {BookCategoryService} from './BookCategory.service';

@Injectable()
export class BookParentCategoryService {
  constructor(
    private readonly categoryService: BookCategoryService,
  ) {}

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

    const otherCategory = await categoryService.findSimilarCategory(
      {
        root: true,
        name: 'b.d',
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
