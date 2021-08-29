import {timeout} from '@shared/helpers';

import {
  CreateBookReviewInput,
  CreateReviewReactionInput,
} from '@api/types/input';

import {
  BookReviewsRepo,
  BookReviewsFilters,
  BookReviewsPaginationResult,
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
   * @param {CreateReviewReactionInput} attrs
   * @return {Promise<CreateBookReactionResult>}
   * @memberof BooksReviewsAjaxRepo
   */
  @SilentRegisterIfAnonymous()
  react(
    {
      id,
      reaction,
    }: CreateReviewReactionInput,
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

  /**
   * Appends user review to book
   *
   * @param {CreateBookReviewInput} input
   * @return {Promise<void>}
   * @memberof BooksReviewsAjaxRepo
   */
  @SilentRegisterIfAnonymous()
  async addBookReview(input: CreateBookReviewInput): Promise<void> {
    console.info(input);
    await timeout(360000);
    return null;
  }
}
