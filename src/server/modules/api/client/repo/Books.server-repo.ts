import {plainToClass} from 'class-transformer';
import {SelectQueryBuilder} from 'typeorm';

import {ID} from '@shared/types';

import {genTagLink} from '@client/routes/Links';
import {
  convertMinutesToSeconds,
  convertHoursToSeconds,
} from '@shared/helpers';

import {BookEntity, BookService} from '@server/modules/book';
import {BooksRepo} from '@api/repo';
import {BasicAPIPagination} from '@api/shared/types';

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
  async findRecentBooks(
    {
      offset = 0,
      limit = 6,
    }: BasicAPIPagination = {},
  ) {
    const {services: {bookService}} = this;
    const books = await (
      bookService
        .createCardsQuery(
          BookService.BOOK_CARD_FIELDS,
          (qb: SelectQueryBuilder<BookEntity>) => (
            qb
              .subQuery()
              .from(BookEntity, 'book')
              .select('*')
              .offset(offset)
              .limit(limit)
              .orderBy('book.createdAt', 'DESC')
          ),
        )
        .orderBy('book.createdAt', 'DESC')
        .getMany()
    );

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
  async findOne(id: ID) {
    const {bookService, bookTextHydratorSeoService} = this.api.services;

    const book = await bookService.findFullCard(+id);
    const serialized = plainToClass(
      BookFullInfoSerializer,
      book,
      {
        excludeExtraneousValues: true,
      },
    );

    const {primaryRelease} = serialized;
    primaryRelease.description = await bookTextHydratorSeoService.hydrateTextWithPopularTags(
      {
        text: primaryRelease.description,
        linkGeneratorFn: (item) => ({
          href: genTagLink(item),
          class: 'c-promo-tag-link',
          target: '_blank',
        }),
      },
    );

    return serialized;
  }
}
