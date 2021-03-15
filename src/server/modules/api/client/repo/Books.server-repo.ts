import {plainToClass} from 'class-transformer';

import {ID} from '@shared/types';
import {convertHoursToSeconds} from '@shared/helpers';

import {APIClientChild} from '@api/APIClient';
import {BooksRepo} from '@api/repo';

import {RedisMemoize} from '../../helpers';
import {MeasureCallDuration} from '../../helpers/MeasureCallDuration';
import {BookFullInfoSerializer} from '../../serializers';

import type {ServerAPIClient} from '../ServerAPIClient';

export class BooksServerRepo extends APIClientChild<ServerAPIClient> implements BooksRepo {
  /**
   * Finds one book
   *
   * @param {ID} id
   * @returns
   * @memberof BooksServerRepo
   */
  @MeasureCallDuration()
  @RedisMemoize(
    (id: ID) => ({
      key: `book-${id}`,
      expire: convertHoursToSeconds(0.5),
    }),
  )
  async findOne(id: ID) {
    const {bookService} = this.api.services;
    const book = await (
      bookService
        .createFullCardQuery()
        .where(
          {
            id,
          },
        )
        .getOne()
    );

    console.info(book);
    return plainToClass(
      BookFullInfoSerializer,
      book,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
