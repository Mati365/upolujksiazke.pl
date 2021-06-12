import {CanBePromise} from '@shared/types';

import {APIPaginationFilters} from '@api/APIClient';
import {
  BooksPaginationResultWithAggs,
  BooksRepo,
  AggsBooksFilters,
  SingleAggBookFilters,
  SingleAggFiltersResult,
  BooksPaginationResult,
} from '@api/repo';

import {AjaxAPIClientChild} from '../AjaxAPIClientChild';

export class BooksAjaxRepo extends AjaxAPIClientChild implements BooksRepo {
  /**
   * Find top ranking page books listing
   *
   * @param {APIPaginationFilters} [filters]
   * @return {Promise<BooksPaginationResult>}
   * @memberof BooksAjaxRepo
   */
  findTopRankingBooks(filters?: APIPaginationFilters): Promise<BooksPaginationResult> {
    return this.ajax.get(
      {
        path: '/books/top-ranking',
        urlParams: filters,
      },
    );
  }

  /**
   * Find all books by filters
   *
   * @param {AggsBooksFilters} filters
   * @returns {CanBePromise<BooksPaginationResultWithAggs>}
   * @memberof BooksAjaxRepo
   */
  findAggregatedBooks(filters: AggsBooksFilters): CanBePromise<BooksPaginationResultWithAggs> {
    return this.ajax.get(
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
   * @returns {CanBePromise<SingleAggFiltersResult>}
   * @memberof BooksAjaxRepo
   */
  findBooksAggsItems(
    {
      agg: {
        name,
        phrase,
        pagination,
      },
      filters,
    }: SingleAggBookFilters,
  ): CanBePromise<SingleAggFiltersResult> {
    return this.ajax.get(
      {
        path: `/books/filters/aggs/${name}`,
        urlParams: {
          aggPhrase: phrase,
          ...filters,
          ...pagination,
        },
      },
    );
  }
}
