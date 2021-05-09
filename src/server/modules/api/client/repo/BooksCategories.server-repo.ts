import {plainToClass} from 'class-transformer';

import {ID} from '@shared/types';
import {BookCategoryRecord} from '@api/types/BookCategory.record';
import {
  BooksCategoriesRepo,
  CategoriesFindOneAttrs,
  MostPopularCategoriesFilters,
} from '@api/repo';

import {BookCategorySerializer} from '../../serializers';
import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {
  MeasureCallDuration,
  RedisMemoize,
} from '../../helpers';

export class BooksCategoriesServerRepo extends ServerAPIClientChild implements BooksCategoriesRepo {
  @MeasureCallDuration('findOneCategory')
  @RedisMemoize(
    {
      keyFn: (id, attrs) => ({
        key: `category-${id}-${JSON.stringify(attrs)}`,
      }),
    },
  )
  async findOne(id: ID, attrs?: CategoriesFindOneAttrs) {
    const {bookCategoryService} = this.services;

    return bookCategoryService.findOne(id, attrs);
  }

  @MeasureCallDuration('findMostPopularCategories')
  @RedisMemoize(
    {
      keyFn: ({limit}) => ({
        key: `popular-books-categories-${limit}`,
      }),
    },
  )
  async findMostPopularCategories(
    {
      limit,
      root,
    }: MostPopularCategoriesFilters,
  ): Promise<BookCategoryRecord[]> {
    const {bookCategoryService} = this.services;
    const categories = await bookCategoryService.findMostPopularCategories(
      {
        limit,
        root,
      },
    );

    return plainToClass(
      BookCategorySerializer,
      categories,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
