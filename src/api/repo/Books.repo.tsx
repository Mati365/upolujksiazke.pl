import {CanBePromise} from '@shared/types';
import {APIRepo} from '../APIRepo';
import {BookRecord} from '../types/Book.record';
import {BookCategoryRecord} from '../types/BookCategory.record';

export type RecentCategoriesBooksFilters = {
  limit?: number;
};

export type CategoryGroupedBooks = {
  category: BookCategoryRecord,
  items: BookRecord[],
}[];

export interface BooksRepo extends APIRepo<BookRecord> {
  findCategoriesRecentBooks(filters?: RecentCategoriesBooksFilters): CanBePromise<CategoryGroupedBooks>;
}
