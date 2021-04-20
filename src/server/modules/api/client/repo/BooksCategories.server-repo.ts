import {plainToClass} from 'class-transformer';

import {PredefinedSeconds} from '@shared/helpers';
import {BookCategoryRecord} from '@api/types/BookCategory.record';
import {BooksCategoriesRepo, MostPopularCategoriesFilters} from '@api/repo';

import {BookCategorySerializer} from '../../serializers';
import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {
  MeasureCallDuration,
  RedisMemoize,
} from '../../helpers';

export class BooksCategoriesServerRepo extends ServerAPIClientChild implements BooksCategoriesRepo {
  @MeasureCallDuration('findMostPopularCategories')
  @RedisMemoize(
    {
      keyFn: ({limit}) => ({
        key: `popular-books-categories-${limit}`,
        expire: PredefinedSeconds.ONE_DAY,
      }),
    },
  )
  async findMostPopularCategories({limit}: MostPopularCategoriesFilters): Promise<BookCategoryRecord[]> {
    const {bookCategoryService} = this.services;
    const categories = await bookCategoryService.findMostPopularCategories(
      {
        limit,
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
