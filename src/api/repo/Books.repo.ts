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
  authorsIds?: number[],
};

export type AggsBooksFilters = BooksFilters & {
  aggs?: Record<keyof BookAggs, boolean>,
};

export type BooksPaginationResultWithAggs = APIPaginationResultWithAggs<BookCardRecord, BookAggs>;

export type BookFindOneAttrs = {
  reviewsCount?: number,
  summariesCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters, BookFindOneAttrs> {
  findAggregatedBooks(filters?: AggsBooksFilters): CanBePromise<BooksPaginationResultWithAggs>;
  findAuthorsBooks(filters?: AuthorsBooksFilters): CanBePromise<APIPaginationResult<BookCardRecord>>;
  findRecentBooks(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
