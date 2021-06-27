import {
  BookReviewsRepo,
  BookReviewsFilters,
  BookReviewsPaginationResult,
  CreateBookReviewReactionAttrs,
  CreateBookReactionResult,
} from '@api/repo';

import {AjaxAPIClientChild} from '../AjaxAPIClientChild';
import {SilentRegisterIfAnonymous} from '../decorators/SilentRegisterIfAnonymous';

export class BooksReviewsAjaxRepo extends AjaxAPIClientChild implements BookReviewsRepo {
  /**
   * Find all reviews by filters
   *
   * @param {BookReviewsFilters} filters
   * @returns {Promise<BookReviewsPaginationResult>}
   * @memberof BooksAjaxRepo
   */
  findAll(filters: BookReviewsFilters): Promise<BookReviewsPaginationResult> {
    return this.ajax.get(
      {
        path: '/books/reviews',
        urlParams: filters,
      },
    );
  }

  /**
   * Sends reaction to book review
   *
   * @param {CreateBookReviewReactionAttrs} attrs
   * @return {Promise<CreateBookReactionResult>}
   * @memberof BooksReviewsAjaxRepo
   */
  @SilentRegisterIfAnonymous()
  react(
    {
      id,
      reaction,
    }: CreateBookReviewReactionAttrs,
  ): Promise<CreateBookReactionResult> {
    return this.ajax.post(
      {
        path: `/books/reviews/${id}/react`,
        body: {
          reaction,
        },
      },
    );
  }
}
