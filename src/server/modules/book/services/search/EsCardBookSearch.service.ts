import {forwardRef, Inject, Injectable} from '@nestjs/common';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';
import {
  createNestedIdsAgg,
  extractNestedBucketsPairs,
  fetchDbAggsRecords,
  mapCountedBucketsPairs,
} from '@server/modules/elasticsearch/helpers';

import {CreateCountedAggType} from '@api/APIRecord';
import {APIPaginationResultWithAggs} from '@api/APIClient';
import {AggsBooksFilters, BookAggs} from '@api/repo';

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
      offset: filters.offset,
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

    if (meta.limit)
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
        cardBookSearch.findBooksByIds(result.ids),
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
        types: mapCountedBucketsPairs(aggs.types.buckets).map(({id, count}) => ({
          record: id,
          count,
        })),
        publishers: fetchDbAggsRecords(
          {
            items: extractNestedBucketsPairs('publishers_ids', aggs.publishers),
            fetchFn: (ids) => BookPublisherEntity.findByIds(ids),
          },
        ),
        categories: fetchDbAggsRecords(
          {
            items: extractNestedBucketsPairs('categories_ids', aggs.categories),
            fetchFn: (ids) => BookCategoryEntity.findByIds(ids),
          },
        ),
        authors: fetchDbAggsRecords(
          {
            items: extractNestedBucketsPairs('authors_ids', aggs.authors),
            fetchFn: (ids) => BookAuthorEntity.findByIds(ids),
          },
        ),
        genre: fetchDbAggsRecords(
          {
            items: extractNestedBucketsPairs('genre_ids', aggs.genre),
            fetchFn: (ids) => BookGenreEntity.findByIds(ids),
          },
        ),
        era: fetchDbAggsRecords(
          {
            items: extractNestedBucketsPairs('era_ids', aggs.era),
            fetchFn: (ids) => BookEraEntity.findByIds(ids),
          },
        ),
        prizes: fetchDbAggsRecords(
          {
            items: extractNestedBucketsPairs('prizes_ids', aggs.prizes),
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
      queries.push(createNestedIdsAgg('publishers'));

    if (aggs.categories)
      queries.push(createNestedIdsAgg('categories'));

    if (aggs.authors)
      queries.push(createNestedIdsAgg('authors'));

    if (aggs.genre)
      queries.push(createNestedIdsAgg('genre'));

    if (aggs.era)
      queries.push(createNestedIdsAgg('era'));

    return queries;
  }
}
