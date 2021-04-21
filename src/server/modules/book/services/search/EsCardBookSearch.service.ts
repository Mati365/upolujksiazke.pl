import {forwardRef, Inject, Injectable} from '@nestjs/common';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {createNestedIdsAgg} from '@server/modules/elasticsearch/helpers/createNestedIdsAgg';

import {APIPaginationResultWithAggs} from '@api/APIClient';
import {BookAggs, BooksFilters} from '@api/repo';

import {EsBookIndex} from '../indexes/EsBook.index';
import {BookEntity} from '../../entity/Book.entity';
import {CardBookSearchService} from './CardBookSearch.service';

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
   * @param {BooksFilters} filters
   * @returns {Promise<APIPaginationResultWithAggs<BookEntity, BookAggs>>}
   * @memberof EsCardBookSearchService
   */
  async findFilteredBooks(filters: BooksFilters): Promise<APIPaginationResultWithAggs<BookEntity, BookAggs>> {
    const {bookEsIndex, cardBookSearch} = this;
    const {authorsIds, excludeIds} = filters;

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

    if (!esQuery)
      return null;

    let esSearchBody = (
      esb
        .requestBodySearch()
        .source(['_id'])
        .query(esQuery)
    );

    if (filters.aggs) {
      esSearchBody = esSearchBody.aggs(
        this.createFilteredBooksAggsEsQueries(filters),
      );
    }

    const ids = await bookEsIndex.searchIds(esSearchBody.toJSON());
    return {
      items: await cardBookSearch.findBooksByIds(ids),
      meta: {
        limit: filters.limit,
        offset: filters.offset,
      },
      aggs: null,
    };
  }

  /**
   * Create elasticsearch aggs query
   *
   * @private
   * @param {BooksFilters} filters
   * @returns {esb.Aggregation[]}
   * @memberof EsCardBookSearchService
   */
  private createFilteredBooksAggsEsQueries(filters: BooksFilters): esb.Aggregation[] {
    const {aggs} = filters;

    if (!aggs || R.isEmpty(aggs))
      return null;

    const queries: esb.Aggregation[] = [];
    if (aggs.types) {
      queries.push(
        esb.termsAggregation('types', 'allTypes'),
      );
    }

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
