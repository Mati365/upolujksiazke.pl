import {CanBePromise} from '@shared/types';

import {APIRepo} from '../APIRepo';
import {BookCategoryRecord} from '../types/BookCategory.record';

export type MostPopularCategoriesFilters = {
  limit: number,
  root?: boolean,
};

export type CategoriesFindOneAttrs = {
  root?: boolean,
};

export interface BooksCategoriesRepo extends APIRepo<BookCategoryRecord, {}, CategoriesFindOneAttrs> {
  findMostPopularCategories(filters: MostPopularCategoriesFilters): CanBePromise<BookCategoryRecord[]>;
}
