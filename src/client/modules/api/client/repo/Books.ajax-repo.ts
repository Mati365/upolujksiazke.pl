import {CanBePromise} from '@shared/types';

import {APIPaginationResult} from '@api/APIClient';
import {BooksRepo, SingleAggBookFilters} from '@api/repo';
import {AjaxAPIClientChild} from '../AjaxAPIClientChild';

export class BooksAjaxRepo extends AjaxAPIClientChild implements BooksRepo {
  findBooksAggsItems(
    {
      agg: {
        name,
        pagination,
      },
      filters,
    }: SingleAggBookFilters): CanBePromise<APIPaginationResult<any>> {
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
