import {plainToClass} from 'class-transformer';

import {
  convertMinutesToSeconds,
  convertHoursToSeconds,
} from '@shared/helpers';

import {ID} from '@shared/types';
import {BooksRepo, SingleBookSearchAttrs} from '@api/repo';
import {BasicAPIPagination} from '@api/APIClient';

import {RedisMemoize} from '../../helpers';
import {MeasureCallDuration} from '../../helpers/MeasureCallDuration';
import {
  BookCardSerializer,
  BookFullInfoSerializer,
} from '../../serializers';

import {ServerAPIClientChild} from '../ServerAPIClientChild';

export class BooksServerRepo extends ServerAPIClientChild implements BooksRepo {
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
    const {services: {cardBookSearchService}} = this;
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
    const {cardBookSearchService} = this.api.services;
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
