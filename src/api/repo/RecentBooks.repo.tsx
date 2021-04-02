import {CanBePromise} from '@shared/types';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';

import {BasicAPIPagination} from '@api/APIClient';
import {APIRepo} from '../APIRepo';
import {BookCardRecord} from '../types/BookCard.record';

export type BooksGroupsFilters = BasicAPIPagination & {
  itemsPerGroup?: number,
};

export interface RecentBooksRepo extends APIRepo<BookCardRecord> {
  findCategoriesPopularBooks(filters?: BooksGroupsFilters): CanBePromise<CategoryBooksGroup[]>;
}
