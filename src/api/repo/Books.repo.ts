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

export type BookCountedAggs = CreateCountedAggType<{
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
  types?: BookType[],
  schoolBook?: boolean,
  categoriesIds?: number[],
  authorsIds?: number[],
  prizesIds?: number[],
  genresIds?: number[],
  erasIds?: number[],
  publishersIds?: number[],
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
  aggs?: Record<keyof BookCountedAggs, {
    limit?: number,
    offset?: number,
  }>,
};

export type BooksPaginationResultWithAggs = APIPaginationResultWithAggs<BookCardRecord, BookCountedAggs>;

export type BookFindOneAttrs = {
  reviewsCount?: number,
  summariesCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters, BookFindOneAttrs> {
  findBooksAggsItems?(attrs: SingleAggBookFilters): CanBePromise<APIPaginationResult<any>>;
  findAggregatedBooks?(filters?: AggsBooksFilters): CanBePromise<BooksPaginationResultWithAggs>;
  findAuthorsBooks?(filters?: AuthorsBooksFilters): CanBePromise<APIPaginationResult<BookCardRecord>>;
  findRecentBooks?(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
