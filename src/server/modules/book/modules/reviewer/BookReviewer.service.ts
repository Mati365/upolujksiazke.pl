import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageResizeSize} from '@shared/types';
import {ImageAttachmentService} from '@server/modules/attachment/services';
import {BookReviewerEntity} from './BookReviewer.entity';
import {CreateBookReviewerDto} from './dto/CreateBookReviewer.dto';

@Injectable()
export class BookReviewerService {
  static readonly BOOK_REVIEWER_AVATAR_SIZES = Object.freeze(
    {
      SMALL_THUMB: new ImageResizeSize(64, ''),
    },
  );

  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Remove multiple book reviewers
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookReviewerService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await BookReviewerEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['avatar'],
        },
      },
    );

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      async (transaction) => {
        for await (const entity of entities)
          await imageAttachmentService.delete(entity.avatar as any[], transaction);

        await transaction.remove(entities);
      },
    );
  }

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
          constraint: 'book_reviewer_unique_remote',
          data: new BookReviewerEntity(
            {
              ...dto,
              remoteId: dto.remoteId ?? dto.name,
            },
          ),
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
