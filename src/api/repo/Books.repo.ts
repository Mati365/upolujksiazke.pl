import {CanBePromise} from '@shared/types';

import {BasicAPIPagination} from '@api/shared/types';
import {BookCardRecord} from '@api/types';
import {APIRepo} from '../APIRepo';
import {BookFullInfoRecord} from '../types/BookFullInfo.record';

export interface BooksRepo extends APIRepo<BookFullInfoRecord> {
  findRecentBooks(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
