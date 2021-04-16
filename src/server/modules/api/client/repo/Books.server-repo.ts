import {plainToClass} from 'class-transformer';

import {
  convertMinutesToSeconds,
  convertHoursToSeconds,
} from '@shared/helpers';

import {ID} from '@shared/types';
import {BasicAPIPagination} from '@api/APIClient';
import {
  AuthorsBooksFilters,
  BookFindOneAttrs,
  BooksFilters,
  BooksRepo,
} from '@api/repo';

import {RedisMemoize} from '../../helpers';
import {MeasureCallDuration} from '../../helpers/MeasureCallDuration';
import {BookCardSerializer, BookFullInfoSerializer} from '../../serializers';

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
    (filters) => ({
      key: `authors-books-${JSON.stringify(filters)}`,
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
      expire: convertMinutesToSeconds(5),
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
   * @param {BookFindOneAttrs} attrs
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
  async findOne(id: ID, {reviewsCount}: BookFindOneAttrs = {}) {
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
