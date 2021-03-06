import * as R from 'ramda';

import {SortKeys} from '@shared/types';
import {BooksRepo} from './repo/Books.repo';

export type APIPaginationFilters<F = {}> = F & {
  phrase?: string,
  limit?: number,
  page?: number,
  totalPages?: number,
  totalItems?: number,
  sort?: SortKeys,
};

export type APIPaginationResult<T, F = {}> = {
  items: T[],
  meta: APIPaginationFilters<F>,
};

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
