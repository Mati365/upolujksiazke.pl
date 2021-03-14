import {plainToClass} from 'class-transformer';

import {ID} from '@shared/types';

import {APIClientChild} from '@api/APIClient';
import {BooksRepo} from '@api/repo';

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
        .limit(1)
        .getOne()
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
