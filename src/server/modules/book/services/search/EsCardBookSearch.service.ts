import {forwardRef, Inject, Injectable} from '@nestjs/common';
import esb from 'elastic-builder';

import {APIPaginationResult} from '@api/APIClient';
import {BooksFilters} from '@api/repo';

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
   * @returns {Promise<APIPaginationResult<BookEntity>>}
   * @memberof EsCardBookSearchService
   */
  async findFilteredBooks(filters: BooksFilters): Promise<APIPaginationResult<BookEntity>> {
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

    const ids = await bookEsIndex.searchIds(
      esb
        .requestBodySearch()
        .source([])
        .query(esQuery)
        .docvalueFields(['_id'])
        .toJSON(),
    );

    return {
      items: await cardBookSearch.findBooksByIds(ids),
      meta: {
        limit: filters.limit,
        offset: filters.offset,
      },
    };
  }
}
