import {CanBePromise} from '@shared/types';

import {BasicAPIPagination} from '@api/APIClient';
import {BookCardRecord} from '@api/types';
import {APIRepo} from '../APIRepo';
import {BookFullInfoRecord} from '../types/BookFullInfo.record';

export type SingleBookSearchAttrs = {
  reviewsCount?: number,
};

export type BooksFilters = BasicAPIPagination & {
  authorsIds: number[],
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters> {
  findRecentBooks(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
