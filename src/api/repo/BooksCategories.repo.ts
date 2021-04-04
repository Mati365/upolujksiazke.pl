import {CanBePromise} from '@shared/types';

import {APIRepo} from '../APIRepo';
import {BookCategoryRecord} from '../types/BookCategory.record';

export type MostPopularCategoriesFilters = {
  limit: number,
};

export interface BooksCategoriesRepo extends APIRepo<BookCategoryRecord> {
  findMostPopularCategories(filters: MostPopularCategoriesFilters): CanBePromise<BookCategoryRecord[]>;
}
