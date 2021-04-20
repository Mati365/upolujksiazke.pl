import {plainToClass} from 'class-transformer';
import * as R from 'ramda';

import {convertHoursToSeconds} from '@shared/helpers';

import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {
  RecentBooksRepo,
  BooksGroupsFilters,
} from '@api/repo';

import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {BookCategoryGroupSerializer} from '../../serializers';
import {
  MeasureCallDuration,
  RedisMemoize,
} from '../../helpers';

export class RecentBooksServerRepo extends ServerAPIClientChild implements RecentBooksRepo {
  /**
   * Return grouped books
   *
   * @param {BooksGroupsFilters} attrs
   * @returns {Promise<CategoryBooksGroup>}
   * @memberof RecentBooksServerRepo
   */
  @MeasureCallDuration('findCategoriesPopularBooks')
  @RedisMemoize(
    {
      keyFn: (filters: BooksGroupsFilters = {}) => ({
        key: `popular-categories-books-${JSON.stringify(
          {
            ...filters,
            categoriesIds: R.sortBy(R.identity, filters.categoriesIds || []),
          },
        )}`,
        expire: convertHoursToSeconds(5),
      }),
    },
  )
  async findCategoriesPopularBooks(filters: BooksGroupsFilters = {}): Promise<CategoryBooksGroup[]> {
    const {cardBookSearchService} = this.services;
    const groupEntities = await cardBookSearchService.findCategoriesPopularBooks(filters);

    return plainToClass(
      BookCategoryGroupSerializer,
      groupEntities,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
