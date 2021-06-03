import {forwardRef, Inject, Injectable} from '@nestjs/common';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {
  objPropsToPromise,
  extractPropIfPresent,
} from '@shared/helpers';

import {
  createNestedIdsAgg,
  wrapWithFilteredGlobalAgg,
  extractBucket,
  fetchDbAggsRecords,
  extractAndMapIdsBucketItems,
  extractGlobalAgg,
  createNestedPaginatedAgg,
} from '@server/modules/elasticsearch/helpers';

import {SortMode} from '@shared/enums';
import {CreateCountedAggType} from '@api/APIRecord';
import {APIPaginationResultWithAggs} from '@api/APIClient';
import {
  AggsBooksFilters,
  BookCountedAggs,
} from '@api/repo';

import {BookEntity} from '../../../entity/Book.entity';
import {CardBookSearchService} from './CardBookSearch.service';

import {BookPublisherEntity} from '../../publisher/BookPublisher.entity';
import {BookCategoryEntity} from '../../category/BookCategory.entity';
import {BookAuthorEntity} from '../../author/BookAuthor.entity';
import {BookGenreEntity} from '../../genre/BookGenre.entity';
import {BookEraEntity} from '../../era/BookEra.entity';
import {BookPrizeEntity} from '../../prize/BookPrize.entity';
import {EsBookIndex} from '../indices/EsBook.index';

export type BookEntityAggs = Pick<BookCountedAggs, 'types'|'schoolLevels'> & CreateCountedAggType<{
  categories: BookCategoryEntity,
  authors: BookAuthorEntity,
  prizes: BookPrizeEntity,
  genre: BookGenreEntity,
  era: BookEraEntity,
  publishers: BookPublisherEntity,
}>;

export type BookAggsNestedQueriesMap = Partial<Record<string, esb.Query>>;

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
   * Find book with filters
   *
   * @param {AggsBooksFilters} filters
   * @param {FindBooksAttrs} [attrs]
   * @return {Promise<APIPaginationResultWithAggs<BookEntity, BookEntityAggs>>}
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

    if (filters.skipBooksLoading)
      esSearchBody = esSearchBody.size(0);
    else if (!R.isNil(meta.limit))
      esSearchBody = esSearchBody.size(meta.limit);

    if (meta.offset)
      esSearchBody = esSearchBody.from(meta.offset);

    if (!R.isNil(filters.sort)) {
      const sortQueries = EsCardBookSearchService.createSortQuery(filters.sort);

      if (sortQueries)
        esSearchBody = esSearchBody.sorts(sortQueries);
    }

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
          : (
            cardBookSearch.findBooksByIds(
              result.ids,
              {
                withDescription: filters.selectDescription,
              },
            )
          ),
      ],
    );

    return {
      items: books,
      meta: {
        totalItems: result.total,
        ...meta,
      },
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
      tagsIds, authorsIds, categoriesIds, parentCategoriesIds,
      genresIds, prizesIds, publishersIds,
      erasIds, types, excludeIds, schoolLevels,
      lowestPrice, highestPrice, phrase,
    } = filters;

    const filtersNestedQueries: BookAggsNestedQueriesMap = {};
    let esQuery: esb.BoolQuery = null;

    if (!R.isNil(lowestPrice))
      filtersNestedQueries.lowestPrice = esb.rangeQuery('lowestPrice').gt(lowestPrice);

    if (!R.isNil(highestPrice))
      filtersNestedQueries.highestPrice = esb.rangeQuery('highestPrice').lt(highestPrice);

    if (authorsIds || categoriesIds || genresIds
        || prizesIds || publishersIds || erasIds
        || excludeIds || types || parentCategoriesIds
        || schoolLevels || tagsIds) {
      const createNestedIdQuery = (name: string, ids: number[], idField: string = 'id') => esb.nestedQuery(
        esb.termsQuery(`${name}.${idField}`, ids),
        name,
      );

      if (tagsIds)
        filtersNestedQueries.tags = createNestedIdQuery('tags', tagsIds);

      if (authorsIds)
        filtersNestedQueries.authors = createNestedIdQuery('authors', authorsIds);

      if (categoriesIds)
        filtersNestedQueries.categories = createNestedIdQuery('categories', categoriesIds);

      if (parentCategoriesIds)
        filtersNestedQueries.parentCategories = createNestedIdQuery('primaryCategory', parentCategoriesIds);

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

      if (schoolLevels) {
        filtersNestedQueries.schoolLevels = esb.nestedQuery(
          esb.termsQuery('schoolBook.classLevel', schoolLevels),
          'schoolBook',
        );
      }

      if (excludeIds) {
        esQuery ??= esb.boolQuery();
        esQuery = esQuery.mustNot(
          esb.termsQuery('_id', excludeIds),
        );
      }
    }

    // by author name / isbn / book title
    if (phrase) {
      esQuery ??= esb.boolQuery();
      esQuery = esQuery.minimumShouldMatch(1).should(
        [
          esb
            .multiMatchQuery(
              [
                'isbns',
                'defaultTitle.autocomplete',
                'defaultTitle.autocomplete._2gram',
                'defaultTitle.autocomplete._3gram',
              ],
              phrase,
            )
            .type('bool_prefix'),

          esb
            .nestedQuery(
              esb
                .multiMatchQuery(
                  [
                    'authors.name.autocomplete',
                    'authors.name.autocomplete._2gram',
                    'authors.name.autocomplete._3gram',
                  ],
                  phrase,
                )
                .type('bool_prefix'),
              'authors',
            ),
        ],
      );
    }

    const queries = R.values(filtersNestedQueries);
    if (!R.isEmpty(queries)) {
      esQuery ??= esb.boolQuery();
      esQuery = esQuery.filter(queries);
    }

    return {
      query: esQuery,
      filtersNestedQueries,
    };
  }

  /**
   * Create sort elasticsearch options based on mode
   *
   * @private
   * @static
   * @param {SortMode} mode
   * @returns {esb.Sort[]}
   * @memberof EsCardBookSearchService
   */
  private static createSortQuery(mode: SortMode): esb.Sort[] {
    switch (mode) {
      case SortMode.RECENTLY_ADDED:
        return [esb.sort('createdAt', 'desc')];

      case SortMode.POPULARITY:
        return [esb.sort('totalRatings', 'desc')];

      case SortMode.ALPHABETIC:
        return [esb.sort('defaultTitle.raw', 'asc')];

      case SortMode.ACCURACY:
      default:
        return null;
    }
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

    const createNestedGlobalAgg = (aggName: string, nestedAggs: esb.Aggregation[]) => {
      if (!R.has(aggName, aggs))
        return null;

      const filterQueries = R.values(R.omit([aggName], filtersNestedQueries));
      return wrapWithFilteredGlobalAgg(
        {
          name: aggName,
          aggs: nestedAggs,
          filterQuery: !R.isEmpty(filterQueries) && (
            esb
              .boolQuery()
              .filter(filterQueries)
          ),
        },
      );
    };

    return [
      createNestedGlobalAgg('types', [
        esb.termsAggregation('types', 'allTypes'),
      ]),

      createNestedGlobalAgg('schoolLevels', [
        createNestedPaginatedAgg(
          {
            ...aggs.schoolLevels,
            aggName: 'schoolLevels',
            nestedDocName: 'schoolBook',
            field: 'classLevel',
          },
        ),
      ]),

      ...BOOKS_IDS_AGGS.flatMap((aggName) => createNestedGlobalAgg(
        aggName,
        [
          createNestedIdsAgg(aggName, aggs[aggName]),
        ],
      )),
    ].filter(Boolean);
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

    const extractIdsAgg = (name: string, resolverClass: any) => {
      const bucket = extractBucket(
        extractPropIfPresent(
          'inner',
          extractGlobalAgg(aggs[name], `${name}_ids`),
        ),
        `${name}_ids`,
      );

      return fetchDbAggsRecords(
        {
          bucket,
          fetchFn: (ids) => resolverClass.findByIds(ids),
        },
      );
    };

    return objPropsToPromise(
      {
        schoolLevels: extractAndMapIdsBucketItems(
          extractGlobalAgg(aggs.schoolLevels, 'schoolLevels'),
          'schoolLevels',
        ),
        types: extractAndMapIdsBucketItems(
          extractGlobalAgg(aggs.types, 'types'),
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
