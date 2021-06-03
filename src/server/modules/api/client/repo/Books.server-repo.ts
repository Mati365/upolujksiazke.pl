import * as R from 'ramda';

import {plainToClass} from 'class-transformer';

import {ID} from '@shared/types';
import {objPropsToPromise} from '@shared/helpers';
import {BasicAPIPagination} from '@api/APIClient';
import {APICountedBucket} from '@api/APIRecord';
import {
  AggsBooksFilters,
  AuthorsBooksFilters,
  BookFindOneAttrs,
  BooksAuthorsGroupedBooks,
  BooksFilters,
  BooksRepo,
  SingleAggBookFilters,
} from '@api/repo';

import {RedisMemoize} from '../../helpers';
import {MeasureCallDuration} from '../../helpers/MeasureCallDuration';
import {
  BookAggsSerializer,
  BookAuthorSerializer,
  BookCardSerializer,
  BookCategorySerializer,
  BookEraSerializer,
  BookFullInfoSerializer,
  BookGenreSerializer,
  BookPrizeSerializer,
  BookPublisherSerializer,
} from '../../serializers';

import {ServerAPIClientChild} from '../ServerAPIClientChild';

export class BooksServerRepo extends ServerAPIClientChild implements BooksRepo {
  static readonly DEFAULT_BOOK_AGGS_FILTERS: AggsBooksFilters['aggs'] = {
    categories: {limit: 5},
    authors: {limit: 5},
    publishers: {limit: 5},
    schoolLevels: {limit: 5},
    prizes: {limit: 5},
    era: {},
    genre: {},
    types: {},
  };

  static readonly BOOK_AGGS_SERIALIZERS: Record<keyof AggsBooksFilters['aggs'], {new(): any}> = {
    categories: BookCategorySerializer,
    authors: BookAuthorSerializer,
    publishers: BookPublisherSerializer,
    era: BookEraSerializer,
    genre: BookGenreSerializer,
    prizes: BookPrizeSerializer,
    schoolLevels: null,
    types: null,
  };

  /**
   * Returns all books for specified authos
   *
   * @param {AuthorsBooksFilters} filters
   * @returns
   * @memberof BooksServerRepo
   */
  @MeasureCallDuration('findAuthorsBooks')
  @RedisMemoize(
    {
      keyFn: (filters) => ({
        key: `authors-books-${JSON.stringify(filters)}`,
      }),
    },
  )
  async findGroupedAuthorsBooks(filters: AuthorsBooksFilters): Promise<BooksAuthorsGroupedBooks> {
    const authorsBooksPairs: [number, Promise<any>][] = filters.authorsIds.map(
      (authorId) => [
        authorId,
        this
          .findAll(
            {
              ...filters,
              authorsIds: [authorId],
            },
          )
          .then((r) => r.items),
      ],
    );

    return objPropsToPromise(
      R.fromPairs(authorsBooksPairs),
    );
  }

  /**
   * Find all books that matches filters
   *
   * @param {BooksFilters} filters
   * @memberof BooksServerRepo
   */
  async findAll(filters: BooksFilters) {
    const {esCardBookSearchService} = this.services;
    const {meta, items} = await esCardBookSearchService.findFilteredBooks(filters);

    return {
      meta,
      items: plainToClass(
        BookCardSerializer,
        items,
        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }

  /**
   * Finds single agg paginated values
   *
   * @param {SingleAggBookFilters} {agg, filters}
   * @returns
   * @memberof BooksServerRepo
   */
  async findBooksAggsItems({agg, filters}: SingleAggBookFilters) {
    const {esCardBookSearchService} = this.services;
    const {aggs, meta} = await esCardBookSearchService.findFilteredBooks(
      {
        ...filters,
        limit: 0,
        skipBooksLoading: true,
        aggs: {
          [agg.name]: {
            ...agg.pagination,
            phrase: agg.phrase,
          },
        } as AggsBooksFilters['aggs'],
      },
    );

    const currentAgg: APICountedBucket<any> = aggs?.[agg.name];
    const serializer = BooksServerRepo.BOOK_AGGS_SERIALIZERS[agg.name];
    let items: any[] = currentAgg?.items || [];

    if (serializer) {
      items = items.map(
        ({record, ...rest}) => ({
          record: plainToClass(
            serializer,
            record,
            {
              excludeExtraneousValues: true,
            },
          ),
          ...rest,
        }),
      );
    }

    return {
      global: meta,
      agg: {
        ...currentAgg,
        items,
      },
    };
  }

  /**
   * Find all books that matches filters
   *
   * @param {AggsBooksFilters} filters
   * @memberof BooksServerRepo
   */
  @MeasureCallDuration('findAggregatedBooks')
  @RedisMemoize(
    {
      keyFn: (filters) => ({
        key: `aggregated-books-${JSON.stringify(filters)}`,
      }),
    },
  )
  async findAggregatedBooks(filters: AggsBooksFilters) {
    const {esCardBookSearchService} = this.services;
    const {meta, items, aggs} = await esCardBookSearchService.findFilteredBooks(
      {
        ...filters,
        aggs: filters.aggs ?? BooksServerRepo.DEFAULT_BOOK_AGGS_FILTERS,
      },
    );

    return {
      meta,
      aggs: plainToClass(
        BookAggsSerializer,
        aggs,
        {
          excludeExtraneousValues: true,
        },
      ),
      items: plainToClass(
        BookCardSerializer,
        items,
        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }

  /**
   * Picks newest books
   *
   * @param {BasicAPIPagination} filters
   * @returns
   * @memberof RecentBooksServerRepo
   */
  @MeasureCallDuration('findRecentBooks')
  @RedisMemoize(
    {
      keyFn: ({limit, offset}) => ({
        key: `recent-books-${offset}-${limit}`,
      }),
    },
  )
  async findRecentBooks(attrs: BasicAPIPagination = {}) {
    const {cardBookSearchService} = this.services;
    const books = await cardBookSearchService.findRecentBooks(attrs);

    return plainToClass(
      BookCardSerializer,
      books,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  /**
   * Find one book
   *
   * @param {ID} id
   * @param {BookFindOneAttrs} attrs
   * @returns
   * @memberof BooksServerRepo
   */
  @MeasureCallDuration((id: ID) => `findOne(id: ${id})`)
  @RedisMemoize(
    {
      keyFn: (id: ID) => ({
        key: `book-${id}`,
      }),
    },
  )
  async findOne(
    id: ID,
    {
      reviewsCount = 5,
      summariesCount = 4,
    }: BookFindOneAttrs = {},
  ) {
    const {cardBookSearchService} = this.services;
    const book = await cardBookSearchService.findFullCard(
      {
        id: +id,
        reviewsCount,
        summariesCount,
      },
    );

    return plainToClass(
      BookFullInfoSerializer,
      book,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
