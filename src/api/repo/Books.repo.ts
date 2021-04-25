import {CanBePromise} from '@shared/types';

import {CreateCountedAggType} from '@api/APIRecord';
import {
  APIPaginationResult,
  APIPaginationResultWithAggs,
  BasicAPIPagination,
} from '@api/APIClient';

import {BookType} from '@shared/enums';
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

export type BookAggs = CreateCountedAggType<{
  categories: BookCategoryRecord,
  authors: BookAuthorRecord,
  types: BookType,
  prizes: BookPrizeRecord,
  genre: BookGenreRecord,
  era: BookEraRecord,
  publishers: BookPublisherRecord,
  schoolBook: boolean,
}>;

export type BooksFilters = BasicAPIPagination & {
  categoriesIds?: number[],
  authorsIds?: number[],
  types?: BookType[],
  prizesIds?: number[],
  genresIds?: number[],
  erasIds?: number[],
  publishersIds?: number[],
  schoolBook?: boolean,
};

export type SingleAggBookFilters = {
  filters: BooksFilters,
  agg: {
    name: string,
    pagination: BasicAPIPagination,
  },
};

export type AggsBooksFilters = BooksFilters & {
  skipBooksLoading?: boolean,
  aggs?: Record<keyof BookAggs, {
    limit?: number,
    offset?: number,
  }>,
};

export type BooksPaginationResultWithAggs = APIPaginationResultWithAggs<BookCardRecord, BookAggs>;

export type BookFindOneAttrs = {
  reviewsCount?: number,
  summariesCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters, BookFindOneAttrs> {
  findBooksAggsItems(attrs: SingleAggBookFilters): CanBePromise<APIPaginationResult<any>>;
  findAggregatedBooks(filters?: AggsBooksFilters): CanBePromise<BooksPaginationResultWithAggs>;
  findAuthorsBooks(filters?: AuthorsBooksFilters): CanBePromise<APIPaginationResult<BookCardRecord>>;
  findRecentBooks(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
