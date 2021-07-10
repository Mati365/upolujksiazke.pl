import {plainToClass} from 'class-transformer';

import {BookReviewRecord} from '@api/types';
import {CreateReviewReactionInput} from '@api/types/input';
import {
  BookReviewsFilters,
  BookReviewsRepo,
  CreateBookReactionResult,
  RecentCommentedBooksFilters,
} from '@api/repo';

import {Authorized} from '../../decorators/Authorized';
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

  /**
   * Find comments and assigned books
   *
   * @param {RecentCommentedBooksFilters} attrs
   * @return {Promise<BookReviewRecord[]>}
   * @memberof BooksReviewsServerRepo
   */
  @MeasureCallDuration('findRecentCommentedBooks')
  @RedisMemoize(
    {
      keyFn: (attrs) => ({
        key: `review-${JSON.stringify(attrs)}`,
        expire: 100,
      }),
    },
  )
  async findRecentCommentedBooks(filters: RecentCommentedBooksFilters): Promise<BookReviewRecord[]> {
    const {bookReviewService} = this.services;
    const result = await bookReviewService.findRecentBooksComments(filters);

    return plainToClass(
      BookReviewSerializer,
      result,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  /**
   * Handle like / dislike
   *
   * @param {CreateReviewReactionInput} attrs
   * @return {Promise<CreateBookReactionResult>}
   * @memberof BooksReviewsServerRepo
   */
  @Authorized
  async react(attrs: CreateReviewReactionInput): Promise<CreateBookReactionResult> {
    const {bookReviewService, decodedJWT} = this.services;
    const stats = await bookReviewService.react(
      {
        ...attrs,
        userId: decodedJWT.id,
      },
    );

    return {
      stats,
    };
  }
}
