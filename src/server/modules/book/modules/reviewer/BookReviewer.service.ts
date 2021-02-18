import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {Size} from '@shared/types';
import {ImageAttachmentService} from '@server/modules/attachment/services';
import {BookReviewerEntity} from './BookReviewer.entity';
import {CreateBookReviewerDto} from './dto/CreateBookReviewer.dto';

@Injectable()
export class BookReviewerService {
  static readonly BOOK_REVIEWER_AVATAR_SIZES = Object.freeze(
    {
      SMALL_THUMB: new Size(64, null),
    },
  );

  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Creates or updates book reviewer
   *
   * @param {CreateBookReviewerDto} dto
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<BookReviewerEntity>}
   * @memberof BookReviewerService
   */
  async upsert(
    {avatar, ...dto}: CreateBookReviewerDto,
    attrs: UpsertResourceAttrs = {},
  ): Promise<BookReviewerEntity> {
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const {connection, imageAttachmentService} = this;
    const executor = async (transaction: EntityManager) => {
      const reviewer = await upsert(
        {
          connection,
          entityManager: transaction,
          Entity: BookReviewerEntity,
          primaryKey: 'remoteId',
          data: new BookReviewerEntity(dto),
        },
      );

      if (avatar) {
        await imageAttachmentService.upsertImage(
          {
            entityManager: transaction,
            entity: reviewer,
            resourceColName: 'avatar',
            image: avatar,
            manyToMany: {
              tableName: BookReviewerEntity.avatarTableName,
              idEntityColName: 'bookReviewerId',
            },
            fetcher: {
              destSubDir: `avatar/${reviewer.id}`,
              sizes: BookReviewerService.BOOK_REVIEWER_AVATAR_SIZES,
            },
            upsertResources,
          },
        );
      }

      return reviewer;
    };

    return forwardTransaction(
      {
        connection,
        entityManager,
      },
      executor,
    );
  }
}
