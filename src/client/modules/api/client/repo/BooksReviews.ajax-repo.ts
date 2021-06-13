import {
  BookReviewsRepo,
  BookReviewsFilters,
  BookReviewsPaginationResult,
} from '@api/repo';

import {AjaxAPIClientChild} from '../AjaxAPIClientChild';

export class BooksReviewsAjaxRepo extends AjaxAPIClientChild implements BookReviewsRepo {
  /**
   * Find all reviews by filters
   *
   * @param {BookReviewsFilters\} filters
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
}
