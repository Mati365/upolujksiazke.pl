import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {BookReviewerEntity} from './BookReviewer.entity';
import {CreateBookReviewerDto} from './dto/CreateBookReviewer.dto';

@Injectable()
export class BookReviewerService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates or updates book reviewer
   *
   * @param {CreateBookReviewerDto} dto
   * @returns {Promise<BookReviewerEntity>}
   * @memberof BookReviewerService
   */
  async upsert(dto: CreateBookReviewerDto): Promise<BookReviewerEntity> {
    const {connection} = this;

    return upsert(
      {
        connection,
        Entity: BookReviewerEntity,
        primaryKey: 'remoteId',
        data: new BookReviewerEntity(dto),
      },
    );
  }
}
