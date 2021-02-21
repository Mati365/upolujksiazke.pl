import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import pMap from 'p-map';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageResizeSize} from '@shared/types';
import {ImageAttachmentService, ImageResizeConfig} from '@server/modules/attachment/services';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '../availability/dto/CreateBookAvailability.dto';
import {CreateBookReviewDto} from '../review/dto/CreateBookReview.dto';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookPublisherService} from '../publisher/BookPublisher.service';
import {BookAvailabilityService} from '../availability/BookAvailability.service';
import {BookReviewService} from '../review/BookReview.service';

@Injectable()
export class BookReleaseService {
  static readonly COVER_IMAGE_SIZES = Object.freeze<ImageResizeConfig>(
    {
      SMALL_THUMB: new ImageResizeSize(78, 117),
      THUMB: new ImageResizeSize(147, 221),
      PREVIEW: new ImageResizeSize(220, 330),
      BIG: new ImageResizeSize(320, 484),
    },
  );

  constructor(
    private readonly connection: Connection,
    private readonly publisherService: BookPublisherService,
    private readonly availabilityService: BookAvailabilityService,
    private readonly reviewsService: BookReviewService,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Remove multiple book releases
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookReleaseService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await BookReleaseEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['cover'],
        },
      },
    );

    await forwardTransaction({connection, entityManager}, async (transaction) => {
      for await (const entity of entities)
        await imageAttachmentService.delete(entity.cover as any[], transaction);

      await transaction.remove(entities);
    });
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateRemoteRecordDto} dto
   * @param {PostHookEntityManager} [entityManager]
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  async upsert(
    {
      cover,
      childReleases,
      publisher, publisherId,
      reviews,
      availability,
      ...dto
    }: CreateBookReleaseDto,

    attrs: UpsertResourceAttrs = {},
  ): Promise<BookReleaseEntity> {
    const {
      connection,
      publisherService,
      availabilityService,
      imageAttachmentService,
      reviewsService,
    } = this;

    const executor = async (transaction: EntityManager) => {
      const transactionAttrs: UpsertResourceAttrs = {
        ...attrs,
        entityManager: transaction,
      };

      const releaseEntity = await upsert(
        {
          connection,
          primaryKey: 'isbn',
          entityManager: transaction,
          Entity: BookReleaseEntity,
          data: new BookReleaseEntity(
            {
              ...dto,
              publisherId: publisherId ?? (await (publisher && publisherService.upsert(
                publisher,
                transactionAttrs,
              )))?.id,
            },
          ),
        },
      );

      if (reviews?.length) {
        await reviewsService.upsert(
          reviews.map((review) => new CreateBookReviewDto(
            {
              ...review,
              bookId: releaseEntity.bookId,
              releaseId: releaseEntity.id,
            },
          )),
          transactionAttrs,
        );
      }

      if (availability?.length) {
        await availabilityService.upsertList(
          availability.map(
            (item) => new CreateBookAvailabilityDto(
              {
                ...item,
                bookId: releaseEntity.bookId,
                releaseId: releaseEntity.id,
              },
            ),
          ),
          transaction,
        );
      }

      if (childReleases?.length) {
        await this.upsertList(
          childReleases.map(
            (childDto) => new CreateBookReleaseDto(
              {
                ...childDto,
                bookId: releaseEntity.bookId,
                publisherId: releaseEntity.publisherId,
                parentReleaseId: releaseEntity.id,
              },
            ),
          ),
          transactionAttrs,
        );
      }

      await imageAttachmentService.upsertImage(
        {
          upsertResources: transactionAttrs.upsertResources,
          entityManager: transaction,
          entity: releaseEntity,
          resourceColName: 'cover',
          image: cover,
          manyToMany: {
            tableName: BookReleaseEntity.coverTableName,
            idEntityColName: 'bookReleaseId',
          },
          fetcher: {
            destSubDir: `cover/${releaseEntity.id}`,
            sizes: BookReleaseService.COVER_IMAGE_SIZES,
          },
        },
      );

      return releaseEntity;
    };

    return forwardTransaction(
      {
        connection,
        entityManager: attrs.entityManager,
      },
      executor,
    );
  }

  /**
   * Create or update array of books releases
   *
   * @param {CreateBookReleaseDto[]} dtos
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<BookReleaseEntity[]>}
   * @memberof BookReleaseService
   */
  async upsertList(
    dtos: CreateBookReleaseDto[],
    attrs: UpsertResourceAttrs = {},
  ): Promise<BookReleaseEntity[]> {
    if (!dtos?.length)
      return [];

    // do not use Promise.all! It breaks typeorm!
    return forwardTransaction(
      {
        connection: this.connection,
        entityManager: attrs.entityManager,
      },
      (transaction) => pMap(
        dtos,
        (item) => this.upsert(
          item,
          {
            ...attrs,
            entityManager: transaction,
          },
        ),
        {
          concurrency: 1,
        },
      ),
    );
  }
}
