import {forwardRef, Inject, Injectable} from '@nestjs/common';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';
import {
  createNestedIdsAgg,
  extractBucket,
  fetchDbAggsRecords,
  mapBucketItems,
} from '@server/modules/elasticsearch/helpers';

import {CreateCountedAggType} from '@api/APIRecord';
import {APIPaginationResultWithAggs} from '@api/APIClient';
import {AggsBooksFilters, BookAggs} from '@api/repo';
import {BookType} from '@shared/enums';

import {EsBookIndex} from '../indexes/EsBook.index';
import {BookEntity} from '../../entity/Book.entity';
import {CardBookSearchService} from './CardBookSearch.service';

import {BookPublisherEntity} from '../../modules/publisher/BookPublisher.entity';
import {BookCategoryEntity} from '../../modules/category/BookCategory.entity';
import {BookAuthorEntity} from '../../modules/author/BookAuthor.entity';
import {BookGenreEntity} from '../../modules/genre/BookGenre.entity';
import {BookEraEntity} from '../../modules/era/BookEra.entity';
import {BookPrizeEntity} from '../../modules/prize/BookPrize.entity';

export type BookEntityAggs = Pick<BookAggs, 'types'|'schoolBook'> & CreateCountedAggType<{
  categories: BookCategoryEntity,
  authors: BookAuthorEntity,
  prizes: BookPrizeEntity,
  genre: BookGenreEntity,
  era: BookEraEntity,
  publishers: BookPublisherEntity,
}>;

@Injectable()
export class EsCardBookSearchService {
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
    const {authorsIds, excludeIds} = filters;
    const meta = {
      limit: filters.limit,
      offset: filters.offset || 0,
    };

    let esQuery: esb.Query = null;
    if (authorsIds || excludeIds) {
      esQuery = esb.boolQuery();

      if (authorsIds) {
        esQuery = (<esb.BoolQuery> esQuery).must(
          [
            esb.nestedQuery(
              esb.termsQuery('authors.id', filters.authorsIds),
              'authors',
            ),
          ],
        );
      }

      if (excludeIds) {
        esQuery = (<esb.BoolQuery> esQuery).mustNot(
          [
            esb.termsQuery('_id', excludeIds),
          ],
        );
      }
    }

    let esSearchBody = (
      esb
        .requestBodySearch()
        .source(['_id'])
    );

    if (!R.isNil(meta.limit))
      esSearchBody = esSearchBody.size(meta.limit);

    if (meta.offset)
      esSearchBody = esSearchBody.from(meta.offset);

    if (esQuery)
      esSearchBody = esSearchBody.query(esQuery);

    if (filters.aggs) {
      esSearchBody = esSearchBody.aggs(
        this.createFilteredBooksAggsEsQueries(filters),
      );
    }

    const result = await bookEsIndex.searchIdsWithAggs(esSearchBody.toJSON());
    if (!result)
      return null;

    const [aggs, books] = await Promise.all(
      [
        this.fetchBooksAggs(result.aggs),
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
   * Fetches all aggregations records
   *
   * @private
   * @param {*} aggs
   * @returns {Promise<BookEntityAggs>}
   * @memberof EsCardBookSearchService
   */
  private async fetchBooksAggs(aggs: any): Promise<BookEntityAggs> {
    if (!aggs)
      return null;

    return objPropsToPromise(
      {
        types: mapBucketItems(
          ({count, record}) => ({
            record: +record.id as BookType,
            count,
          }),
          extractBucket(aggs.types),
        ),
        publishers: fetchDbAggsRecords(
          {
            bucket: extractBucket(aggs.publishers, 'publishers_ids'),
            fetchFn: (ids) => BookPublisherEntity.findByIds(ids),
          },
        ),
        categories: fetchDbAggsRecords(
          {
            bucket: extractBucket(aggs.categories, 'categories_ids'),
            fetchFn: (ids) => BookCategoryEntity.findByIds(ids),
          },
        ),
        authors: fetchDbAggsRecords(
          {
            bucket: extractBucket(aggs.authors, 'authors_ids'),
            fetchFn: (ids) => BookAuthorEntity.findByIds(ids),
          },
        ),
        genre: fetchDbAggsRecords(
          {
            bucket: extractBucket(aggs.genre, 'genre_ids'),
            fetchFn: (ids) => BookGenreEntity.findByIds(ids),
          },
        ),
        era: fetchDbAggsRecords(
          {
            bucket: extractBucket(aggs.era, 'era_ids'),
            fetchFn: (ids) => BookEraEntity.findByIds(ids),
          },
        ),
        prizes: fetchDbAggsRecords(
          {
            bucket: extractBucket(aggs.prizes, 'prizes_ids'),
            fetchFn: (ids) => BookPrizeEntity.findByIds(ids),
          },
        ),
      },
    );
  }

  /**
   * Create elasticsearch aggs query
   *
   * @private
   * @param {AggsBooksFilters} filters
   * @returns {esb.Aggregation[]}
   * @memberof EsCardBookSearchService
   */
  private createFilteredBooksAggsEsQueries(filters: AggsBooksFilters): esb.Aggregation[] {
    const {aggs} = filters;

    if (!aggs || R.isEmpty(aggs))
      return null;

    const queries: esb.Aggregation[] = [];
    if (aggs.types)
      queries.push(esb.termsAggregation('types', 'allTypes'));

    if (aggs.publishers)
      queries.push(createNestedIdsAgg('publishers', aggs.publishers));

    if (aggs.categories)
      queries.push(createNestedIdsAgg('categories', aggs.categories));

    if (aggs.authors)
      queries.push(createNestedIdsAgg('authors', aggs.authors));

    if (aggs.genre)
      queries.push(createNestedIdsAgg('genre', aggs.genre));

    if (aggs.era)
      queries.push(createNestedIdsAgg('era', aggs.era));

    return queries;
  }
}
