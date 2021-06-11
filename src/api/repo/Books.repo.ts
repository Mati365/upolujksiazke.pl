import {
  CreateObjArrayType,
  CanBePromise,
  PaginationMeta,
} from '@shared/types';

import {APICountedBucket, CreateCountedAggType} from '@api/APIRecord';
import {
  APIPaginationResult,
  APIPaginationResultWithAggs,
  BasicAPIPagination,
} from '@api/APIClient';

import {
  BookSchoolLevel,
  BookType,
  SortMode,
} from '@shared/enums';

import {
  BookAuthorRecord,
  BookCardRecord,
  BookCategoryRecord,
  BookEraRecord,
  BookGenreRecord,
  BookPrizeRecord,
  BookPublisherRecord,
} from '@api/types';

import {APIRepo} from '../APIRepo';
import {BookFullInfoRecord} from '../types/BookFullInfo.record';

export type AuthorsBooksFilters = BasicAPIPagination & {
  authorsIds: number[],
};

export type BookAggsRecords = {
  categories: BookCategoryRecord,
  authors: BookAuthorRecord,
  types: BookType,
  prizes: BookPrizeRecord,
  genre: BookGenreRecord,
  era: BookEraRecord,
  publishers: BookPublisherRecord,
  schoolLevels: BookSchoolLevel,
};

export type BookCountedAggs = CreateCountedAggType<BookAggsRecords>;

export type BooksNonNestedFilters = BasicAPIPagination & {
  selectDescription?: boolean,
  sort?: SortMode,
  phrase?: string,
  types?: BookType[],
  schoolLevels?: BookSchoolLevel[],
  lowestPrice?: number,
  highestPrice?: number,
};

export type BooksFiltersWithNames = BooksNonNestedFilters & (
  CreateObjArrayType<BookAggsRecords>
);

export type BooksFilters = BooksNonNestedFilters & {
  parentCategoriesIds?: number[],
  categoriesIds?: number[],
  authorsIds?: number[],
  prizesIds?: number[],
  genresIds?: number[],
  erasIds?: number[],
  publishersIds?: number[],
  tagsIds?: number[],
};

export type SingleAggBookFilters = {
  filters: BooksFilters,
  agg: {
    name: string,
    phrase?: string,
    pagination: BasicAPIPagination,
  },
};

export type SingleAggFiltersResult = {
  global: PaginationMeta,
  agg: APICountedBucket<any>,
};

export type AggsBooksFilters = BooksFilters & {
  skipBooksLoading?: boolean,
  aggs?: Record<keyof BookCountedAggs, {
    limit?: number,
    offset?: number,
    phrase?: string,
  }>,
};

export type BooksPaginationResult = APIPaginationResult<BookCardRecord>;

export type BooksPaginationResultWithAggs = APIPaginationResultWithAggs<BookCardRecord, BookCountedAggs>;

export type BooksAuthorsGroupedBooks = Record<number, BookCardRecord[]>;

export type BookFindOneAttrs = {
  reviewsCount?: number,
  summariesCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters, BookFindOneAttrs> {
  findBooksAggsItems?(attrs: SingleAggBookFilters): CanBePromise<SingleAggFiltersResult>;
  findAggregatedBooks?(filters?: AggsBooksFilters): CanBePromise<BooksPaginationResultWithAggs>;
  findGroupedAuthorsBooks?(filters?: AuthorsBooksFilters): CanBePromise<BooksAuthorsGroupedBooks>;
  findRecentBooks?(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
