import {plainToClass} from 'class-transformer';

import {BookReviewsFilters, BookReviewsRepo} from '@api/repo';
import {BookReviewSerializer} from '../../serializers';
import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {
  MeasureCallDuration,
  RedisMemoize,
} from '../../helpers';

export class BooksReviewsServerRepo extends ServerAPIClientChild implements BookReviewsRepo {
  /**
   * Find all reviews that matches filters
   *
   * @param {AggsBooksFilters} filters
   * @memberof BooksServerRepo
   */
  @MeasureCallDuration('findAllReviews')
  @RedisMemoize(
    {
      keyFn: (filters) => ({
        key: `books-reviews-${JSON.stringify(filters)}`,
      }),
    },
  )
  async findAll(filters: BookReviewsFilters) {
    const {bookReviewService} = this.services;
    const {meta, items} = await bookReviewService.findBookReviews(
      {
        ...filters,
        pagination: true,
      },
    );

    return {
      meta,
      items: plainToClass(
        BookReviewSerializer,
        items,
        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }

  /**
   * Single review fetch
   *
   * @param {number} id
   * @returns
   * @memberof BooksReviewsServerRepo
   */
  @MeasureCallDuration('findReview')
  @RedisMemoize(
    {
      keyFn: (id) => ({
        key: `review-${id}`,
      }),
    },
  )
  async findOne(id: number) {
    const {bookReviewService} = this.services;

    return plainToClass(
      BookReviewSerializer,
      await bookReviewService.findOne(id),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
