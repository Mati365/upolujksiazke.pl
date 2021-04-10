import {plainToClass} from 'class-transformer';
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
    (filters: BooksGroupsFilters = {}) => ({
      key: `popular-categories-books-${JSON.stringify(filters)}`,
      expire: convertHoursToSeconds(5),
      disabled: filters.categoriesIds?.length > 2,
    }),
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
