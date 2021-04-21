import {CanBePromise} from '@shared/types';

import {APIPaginationResult, APIPaginationResultWithAggs, BasicAPIPagination} from '@api/APIClient';
import {BookCardRecord} from '@api/types';
import {APIRepo} from '../APIRepo';
import {BookFullInfoRecord} from '../types/BookFullInfo.record';

export type AuthorsBooksFilters = BasicAPIPagination & {
  authorsIds: number[],
};

export type BookAggs = Partial<{
  categories?: boolean,
  authors?: boolean,
  types?: boolean,
  era?: boolean,
  schoolBook?: boolean,
  prizes?: boolean,
  genre?: boolean,
  publisher?: boolean,
}>;

export type BooksFilters = BasicAPIPagination & {
  authorsIds?: number[],
  aggs?: Record<keyof BookAggs, boolean>,
};

export type BooksPaginationResultWithAggs = APIPaginationResultWithAggs<BookCardRecord, BooksFilters>;

export type BookFindOneAttrs = {
  reviewsCount?: number,
  summariesCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters, BookFindOneAttrs> {
  findAuthorsBooks(filters?: AuthorsBooksFilters): CanBePromise<APIPaginationResult<BookCardRecord>>;
  findRecentBooks(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
