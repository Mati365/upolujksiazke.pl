import {plainToClass} from 'class-transformer';

import {
  convertMinutesToSeconds,
  convertHoursToSeconds,
} from '@shared/helpers';

import {ID} from '@shared/types';
import {BasicAPIPagination} from '@api/APIClient';
import {
  AuthorsBooksFilters, BooksFilters,
  BooksRepo, SingleBookSearchAttrs,
} from '@api/repo';

import {RedisMemoize} from '../../helpers';
import {MeasureCallDuration} from '../../helpers/MeasureCallDuration';
import {
  BookCardSerializer,
  BookFullInfoSerializer,
} from '../../serializers';

import {ServerAPIClientChild} from '../ServerAPIClientChild';

export class BooksServerRepo extends ServerAPIClientChild implements BooksRepo {
  /**
   * Returns all books for specified authos
   *
   * @param {AuthorsBooksFilters} filters
   * @returns
   * @memberof BooksServerRepo
   */
  @MeasureCallDuration('findAuthorsBooks')
  @RedisMemoize(
    ({limit, offset, authorsIds}) => ({
      key: `authors-books-${offset}-${limit}-${authorsIds.join(',')}`,
      expire: convertMinutesToSeconds(35),
    }),
  )
  findAuthorsBooks(filters: AuthorsBooksFilters) {
    return this.findAll(filters);
  }

  /**
   * Find all books that matches filters
   *
   * @param {BooksFilters} filters
   * @memberof BooksServerRepo
   */
  async findAll(filters: BooksFilters) {
    const {cardBookSearchService} = this.services;
    const {meta, items} = await cardBookSearchService.findFilteredBooks(filters);

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
   * Picks newest books
   *
   * @param {BasicAPIPagination} filters
   * @returns
   * @memberof RecentBooksServerRepo
   */
  @MeasureCallDuration('findRecentBooks')
  @RedisMemoize(
    ({limit, offset}) => ({
      key: `recent-books-${offset}-${limit}`,
      expire: convertMinutesToSeconds(35),
    }),
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
   * Finds one book
   *
   * @param {ID} id
   * @param {Object} attrs
   * @returns
   * @memberof BooksServerRepo
   */
  @MeasureCallDuration((id: ID) => `findOne(id: ${id})`)
  @RedisMemoize(
    (id: ID) => ({
      key: `book-${id}`,
      expire: convertHoursToSeconds(0.5),
    }),
  )
  async findOne(
    id: ID,
    {
      reviewsCount,
    }: SingleBookSearchAttrs = {},
  ) {
    const {cardBookSearchService} = this.services;
    const book = await cardBookSearchService.findFullCard(
      {
        id: +id,
        reviewsCount,
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
