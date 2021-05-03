import {CanBePromise} from '@shared/types';
import {CreateCountedAggType} from '@api/APIRecord';
import {
  APIPaginationResult,
  APIPaginationResultWithAggs,
  BasicAPIPagination,
} from '@api/APIClient';

import {BookSchoolLevel, BookType} from '@shared/enums';
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
  schoolLevels: BookSchoolLevel,
}>;

export type BooksFilters = BasicAPIPagination & {
  types?: BookType[],
  schoolLevels?: BookSchoolLevel[],
  categoriesIds?: number[],
  authorsIds?: number[],
  prizesIds?: number[],
  genresIds?: number[],
  erasIds?: number[],
  publishersIds?: number[],
  lowestPrice?: number,
  highestPrice?: number,
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

export type BooksAuthorsGroupedBooks = Record<number, BookCardRecord[]>;

export type BookFindOneAttrs = {
  reviewsCount?: number,
  summariesCount?: number,
};

export interface BooksRepo extends APIRepo<BookFullInfoRecord, BooksFilters, BookFindOneAttrs> {
  findBooksAggsItems?(attrs: SingleAggBookFilters): CanBePromise<APIPaginationResult<any>>;
  findAggregatedBooks?(filters?: AggsBooksFilters): CanBePromise<BooksPaginationResultWithAggs>;
  findGroupedAuthorsBooks?(filters?: AuthorsBooksFilters): CanBePromise<BooksAuthorsGroupedBooks>;
  findRecentBooks?(filters?: BasicAPIPagination): CanBePromise<BookCardRecord[]>;
}
