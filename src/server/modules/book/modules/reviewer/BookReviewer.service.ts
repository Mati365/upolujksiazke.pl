import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {ScrapperRemoteEntity} from '@server/modules/importer/modules/scrapper/entity';
import {BookReviewerDto} from './dto/BookReviewer.dto';
import {BookReviewerEntity} from './BookReviewer.entity';

@Injectable()
export class BookReviewerService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates or updates book reviewer
   *
   * @param {BookReviewerDto} dto
   * @returns {Promise<BookReviewerEntity>}
   * @memberof BookReviewerService
   */
  async upsert(dto: BookReviewerDto): Promise<BookReviewerEntity> {
    const {connection} = this;
    const remoteEntity = await upsert(
      {
        connection,
        Entity: ScrapperRemoteEntity,
        constraint: 'unique_remote_entry',
        data: new ScrapperRemoteEntity(dto.remote),
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
