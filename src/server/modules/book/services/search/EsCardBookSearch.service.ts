import {forwardRef, Inject, Injectable} from '@nestjs/common';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';
import {
  createNestedIdsAgg,
  wrapWithFilteredGlobalAgg,
  extractBucket,
  fetchDbAggsRecords,
  mapBucketItems,
  extractGlobalAgg,
} from '@server/modules/elasticsearch/helpers';

import {CreateCountedAggType} from '@api/APIRecord';
import {APIPaginationResultWithAggs} from '@api/APIClient';
import {BookType} from '@shared/enums';
import {
  AggsBooksFilters,
  BookCountedAggs,
} from '@api/repo';

import {EsBookIndex} from '../indexes/EsBook.index';
import {BookEntity} from '../../entity/Book.entity';
import {CardBookSearchService} from './CardBookSearch.service';

import {BookPublisherEntity} from '../../modules/publisher/BookPublisher.entity';
import {BookCategoryEntity} from '../../modules/category/BookCategory.entity';
import {BookAuthorEntity} from '../../modules/author/BookAuthor.entity';
import {BookGenreEntity} from '../../modules/genre/BookGenre.entity';
import {BookEraEntity} from '../../modules/era/BookEra.entity';
import {BookPrizeEntity} from '../../modules/prize/BookPrize.entity';

export type BookEntityAggs = Pick<BookCountedAggs, 'types'|'schoolBook'> & CreateCountedAggType<{
  categories: BookCategoryEntity,
  authors: BookAuthorEntity,
  prizes: BookPrizeEntity,
  genre: BookGenreEntity,
  era: BookEraEntity,
  publishers: BookPublisherEntity,
}>;

export type BookAggsNestedQueriesMap = Partial<Record<keyof BookEntityAggs, esb.Query>>;

@Injectable()
export class EsCardBookSearchService {
  static readonly BOOKS_IDS_AGGS: (keyof BookEntityAggs)[] = [
    'publishers', 'categories', 'authors',
    'genre', 'era', 'prizes',
  ];

  constructor(
    @Inject(forwardRef(() => EsBookIndex))
    private readonly bookEsIndex: EsBookIndex,
    @Inject(forwardRef(() => CardBookSearchService))
    private readonly cardBookSearch: CardBookSearchService,
  ) {}

  /**
   * Advanced search
   *
   * @async
   * @param {AggsBooksFilters} filters
   * @returns {Promise<APIPaginationResultWithAggs<BookEntity, BookEntityAggs>>}
   * @memberof EsCardBookSearchService
   */
  async findFilteredBooks(filters: AggsBooksFilters): Promise<APIPaginationResultWithAggs<BookEntity, BookEntityAggs>> {
    const {bookEsIndex, cardBookSearch} = this;
    const meta = {
      limit: filters.limit,
      offset: filters.offset || 0,
    };

    const {query, filtersNestedQueries} = this.createNestedEsFiltersQuery(filters);
    let esSearchBody = (
      esb
        .requestBodySearch()
        .source(['_id'])
    );

    if (query && !filters.skipBooksLoading)
      esSearchBody = esSearchBody.query(query);

    if (!R.isNil(meta.limit))
      esSearchBody = esSearchBody.size(meta.limit);

    if (meta.offset)
      esSearchBody = esSearchBody.from(meta.offset);

    if (filters.aggs) {
      esSearchBody = esSearchBody.aggs(
        this.createFilteredBooksAggsEsQueries(
          {
            filtersNestedQueries,
            filters,
          },
        ),
      );
    }

    const result = await bookEsIndex.searchIdsWithAggs(esSearchBody.toJSON());
    if (!result)
      return null;

    const [aggs, books] = await Promise.all(
      [
        this.fetchBooksAggsFromDB(result.aggs),
        filters.skipBooksLoading
          ? null
          : cardBookSearch.findBooksByIds(result.ids),
      ],
    );

    return {
      items: books,
      meta,
      aggs,
    };
  }

  /**
   * Gen filters used in query and aggs
   *
   * @private
   * @param {AggsBooksFilters} filters
   * @returns
   * @memberof EsCardBookSearchService
   */
  private createNestedEsFiltersQuery(filters: AggsBooksFilters) {
    const {
      authorsIds, categoriesIds,
      genresIds, prizesIds, publishersIds,
      erasIds, types, excludeIds,
    } = filters;

    const filtersNestedQueries: BookAggsNestedQueriesMap = {};
    let esQuery: esb.BoolQuery = null;

    if (authorsIds || categoriesIds || genresIds
        || prizesIds || publishersIds || erasIds
        || excludeIds || types) {
      esQuery = esb.boolQuery();

      const createNestedIdQuery = (name: string, ids: number[]) => esb.nestedQuery(
        esb.termsQuery(`${name}.id`, ids),
        name,
      );

      if (authorsIds)
        filtersNestedQueries.authors = createNestedIdQuery('authors', authorsIds);

      if (categoriesIds)
        filtersNestedQueries.categories = createNestedIdQuery('categories', categoriesIds);

      if (genresIds)
        filtersNestedQueries.genre = createNestedIdQuery('genre', genresIds);

      if (prizesIds)
        filtersNestedQueries.prizes = createNestedIdQuery('prizes', prizesIds);

      if (publishersIds)
        filtersNestedQueries.publishers = createNestedIdQuery('publishers', publishersIds);

      if (erasIds)
        filtersNestedQueries.era = createNestedIdQuery('era', erasIds);

      if (types)
        filtersNestedQueries.types = esb.termsQuery('allTypes', types);

      if (excludeIds) {
        esQuery = esQuery.mustNot(
          esb.termsQuery('_id', excludeIds),
        );
      }
    }

    if (esQuery) {
      const queries = R.values(filtersNestedQueries);
      if (!R.isEmpty(queries))
        esQuery = esQuery.filter(queries);
    }

    return {
      query: esQuery,
      filtersNestedQueries,
    };
  }

  /**
   * Create elasticsearch aggs query
   *
   * @private
   * @param {Object} attrs
   * @returns {esb.Aggregation[]}
   * @memberof EsCardBookSearchService
   */
  private createFilteredBooksAggsEsQueries(
    {
      filters,
      filtersNestedQueries,
    }: {
      filters: AggsBooksFilters,
      filtersNestedQueries: BookAggsNestedQueriesMap,
    },
  ): esb.Aggregation[] {
    const {BOOKS_IDS_AGGS} = EsCardBookSearchService;
    const {aggs} = filters;

    if (!aggs || R.isEmpty(aggs))
      return null;

    const queries: esb.Aggregation[] = [];
    if (aggs.types)
      queries.push(esb.termsAggregation('types', 'allTypes'));

    queries.push(
      ...BOOKS_IDS_AGGS
        .flatMap((aggName) => {
          if (!R.has(aggName, aggs))
            return null;

          const filterQueries = R.values(R.omit([aggName], filtersNestedQueries));

          return wrapWithFilteredGlobalAgg(
            {
              name: aggName,
              aggs: [
                createNestedIdsAgg(aggName, aggs[aggName]),
              ],
              filterQuery: !R.isEmpty(filterQueries) && (
                esb
                  .boolQuery()
                  .filter(filterQueries)
              ),
            },
          );
        })
        .filter(Boolean),
    );

    return queries;
  }

  /**
   * Fetches all aggregations records
   *
   * @private
   * @param {*} aggs
   * @returns {Promise<BookEntityAggs>}
   * @memberof EsCardBookSearchService
   */
  private async fetchBooksAggsFromDB(aggs: any): Promise<BookEntityAggs> {
    if (!aggs)
      return null;

    const extractIdsAgg = (name: string, resolverClass: any) => fetchDbAggsRecords(
      {
        bucket: extractBucket(
          extractGlobalAgg(aggs[name], name),
          `${name}_ids`,
        ),
        fetchFn: (ids) => resolverClass.findByIds(ids),
      },
    );

    return objPropsToPromise(
      {
        types: mapBucketItems(
          ({count, record}) => ({
            record: +record.id as BookType,
            count,
          }),
          extractBucket(aggs.types),
        ),
        publishers: extractIdsAgg('publishers', BookPublisherEntity),
        categories: extractIdsAgg('categories', BookCategoryEntity),
        authors: extractIdsAgg('authors', BookAuthorEntity),
        genre: extractIdsAgg('genre', BookGenreEntity),
        era: extractIdsAgg('era', BookEraEntity),
        prizes: extractIdsAgg('prizes', BookPrizeEntity),
      },
    );
  }
}
