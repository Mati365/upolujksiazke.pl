import {CanBePromise} from '@shared/types';

import {APIPaginationResult, BasicAPIPagination} from '@api/APIClient';
import {BookCardRecord} from '@api/types';
import {APIRepo} from '../APIRepo';
import {BookFullInfoRecord} from '../types/BookFullInfo.record';

export type AuthorsBooksFilters = BasicAPIPagination & {
  authorsIds: number[],
};

export type BooksFilters = BasicAPIPagination & {
  authorsIds?: number[],
};

export type BookFindOneAttrs = {
  reviewsCount?: number,
  summariesCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters, BookFindOneAttrs> {
  findAuthorsBooks(filters?: AuthorsBooksFilters): CanBePromise<APIPaginationResult<BookCardRecord>>;
  findRecentBooks(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
