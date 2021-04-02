import * as R from 'ramda';

import type {PaginationResult} from '@server/common/helpers/db';

import {SortKeys} from '@shared/types';
import {RecentBooksRepo} from './repo/RecentBooks.repo';
import {BooksRepo} from './repo/Books.repo';

export type BasicAPIPagination = {
  offset?: number,
  limit?: number,
};

export type APIPaginationFilters<F = {}> = BasicAPIPagination & F & {
  phrase?: string,
  totalPages?: number,
  totalItems?: number,
  sort?: SortKeys,
};

export type APIPaginationResult<T> = PaginationResult<T>;

export abstract class APIClientChild<T extends APIClient = APIClient> {
  protected api: T;

  setAPIClient(api: T) {
    this.api = api;
  }
}

export function isAPIClientChild(obj: any): obj is APIClientChild<any> {
  return !!obj && ('setAPIClient' in obj);
}

export abstract class APIClient {
  constructor(
    public readonly repo: {
      recentBooks: RecentBooksRepo,
      books: BooksRepo,
    },
  ) {
    R.forEachObjIndexed(
      (obj) => {
        if (!isAPIClientChild(obj))
          return;

        obj.setAPIClient(this);
      },
      repo,
    );
  }
}
