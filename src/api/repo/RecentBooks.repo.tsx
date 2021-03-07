import {CanBePromise} from '@shared/types';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {APIRepo} from '../APIRepo';
import {BookCardRecord} from '../types/BookCard.record';

export type BooksGroupsFilters = {
  itemsPerGroup: number,
  limit: number,
  offset: number,
};

export interface RecentBooksRepo extends APIRepo<BookCardRecord> {
  findCategoriesRecentBooks(filters?: BooksGroupsFilters): CanBePromise<CategoryBooksGroup[]>;
}
