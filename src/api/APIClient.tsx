import * as R from 'ramda';

import {
  SortKeys,
  PaginationResult,
} from '@shared/types';

import {
  RecentBooksRepo,
  BooksRepo,
  BooksCategoriesRepo,
  BookAuthorsRepo,
  BookReviewsRepo,
  TagsRepo,
  TrackerRepo,
  UsersRepo,
} from './repo';

export type BasicAPIPagination = {
  excludeIds?: number[],
  offset?: number,
  limit?: number,
};

export type APIPaginationFilters<F = {}> = BasicAPIPagination & F & {
  phrase?: string,
  sortColumns?: SortKeys,
};

export type APIPaginationResult<T> = PaginationResult<T>;

export type APIPaginationResultWithAggs<T, A> = APIPaginationResult<T> & {
  aggs?: A,
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
      recentBooks: RecentBooksRepo,
      books: BooksRepo,
      booksCategories: BooksCategoriesRepo,
      booksReviews: BookReviewsRepo,
      tags: TagsRepo,
      tracker: TrackerRepo,
      authors: BookAuthorsRepo,
      users: UsersRepo,
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
