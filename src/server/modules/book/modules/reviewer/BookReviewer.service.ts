import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {RemoteRecordEntity} from '@server/modules/remote/entity';
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
    const remoteEntity = await upsert(
      {
        connection,
        Entity: RemoteRecordEntity,
        constraint: 'remote_record_unique_remote_entry',
        data: new RemoteRecordEntity(dto.remote),
      },
    );

    return upsert(
      {
        connection,
        Entity: BookReviewerEntity,
        primaryKey: 'remoteId',
        data: new BookReviewerEntity(
          {
            ...dto,
            remote: remoteEntity,
          },
        ),
      },
    );
  }
}
