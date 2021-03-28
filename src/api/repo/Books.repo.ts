import {CanBePromise} from '@shared/types';

import {BasicAPIPagination} from '@api/shared/types';
import {BookCardRecord} from '@api/types';
import {APIRepo} from '../APIRepo';
import {BookFullInfoRecord} from '../types/BookFullInfo.record';

export type SingleBookSearchAttrs = {
  reviewsCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, SingleBookSearchAttrs> {
  findRecentBooks(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
