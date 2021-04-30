import {CanBePromise} from '@shared/types';

import {
  BooksPaginationResultWithAggs,
  BooksRepo,
  AggsBooksFilters,
  SingleAggBookFilters,
} from '@api/repo';

import {AjaxAPIClientChild} from '../AjaxAPIClientChild';

export class BooksAjaxRepo extends AjaxAPIClientChild implements BooksRepo {
  /**
   * Find all books by filters
   *
   * @param {AggsBooksFilters} filters
   * @returns {CanBePromise<BooksPaginationResultWithAggs>}
   * @memberof BooksAjaxRepo
   */
  findAggregatedBooks(filters: AggsBooksFilters): CanBePromise<BooksPaginationResultWithAggs> {
    return this.ajax.apiCall(
      {
        path: '/books',
        urlParams: filters,
      },
    );
  }

  /**
   * Find single filters aggregation items list
   *
   * @param {SingleAggBookFilters} attrs
   * @returns {CanBePromise<BooksPaginationResultWithAggs>}
   * @memberof BooksAjaxRepo
   */
  findBooksAggsItems(
    {
      agg: {
        name,
        pagination,
      },
      filters,
    }: SingleAggBookFilters): CanBePromise<BooksPaginationResultWithAggs> {
    return this.ajax.apiCall(
      {
        path: `/books/filters/aggs/${name}`,
        urlParams: {
          ...pagination,
          ...filters,
        },
      },
    );
  }
}
