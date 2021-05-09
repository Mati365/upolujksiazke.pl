import {Injectable} from '@nestjs/common';
import {Equal, Not} from 'typeorm';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {paginatedAsyncIterator} from '@server/common/helpers/db';

import {EsBookCategoryIndex} from '../indices/EsBookCategory.index';
import {CreateBookCategoryDto} from '../dto/CreateBookCategory.dto';
import {BookCategoryEntity} from '../BookCategory.entity';

@Injectable()
export class BookParentCategoryService {
  constructor(
    private readonly categoryIndex: EsBookCategoryIndex,
  ) {}

  /**
   * Return most similar category name
   *
   * @param {Object} attrs
   * @returns {Promise<CreateBookCategoryDto>}
   * @memberof BookParentCategoryService
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
   *
   *
   * @memberof BookParentCategoryService
   */
  async findAndAssignMissingParentCategories() {
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

    const otherCategory = await this.findSimilarCategory(
      {
        root: true,
        name: 'b.d',
      },
    );

    for await (const [, categories] of categoriesIterator) {
      for await (const category of categories) {
        const matchedRootCategory = await this.findSimilarCategory(
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
