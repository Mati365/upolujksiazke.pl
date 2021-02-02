import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import sequential from 'promise-sequential';
import * as R from 'ramda';

import {Size} from '@shared/types';
import {
  forwardTransaction,
  upsert,
  checkIfExists,
  runInPostHookIfPresent,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageAttachmentService} from '@server/modules/attachment/services';
import {ImageVersion} from '@server/modules/attachment/entity/ImageAttachment.entity';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '../availability/dto/CreateBookAvailability.dto';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookPublisherService} from '../publisher/BookPublisher.service';
import {BookAvailabilityService} from '../availability/BookAvailability.service';

@Injectable()
export class BookReleaseService {
  static readonly COVER_IMAGE_SIZES: Record<ImageVersion, Size> = Object.freeze(
    {
      SMALL_THUMB: new Size(78, 117),
      THUMB: new Size(147, 221),
      PREVIEW: new Size(220, 330),
      BIG: new Size(320, 484),
    },
  );

  constructor(
    private readonly connection: Connection,
    private readonly publisherService: BookPublisherService,
    private readonly availabilityService: BookAvailabilityService,
    private readonly imageAttachmentService: ImageAttachmentService,
    private readonly entityManager: EntityManager,
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
      availability,
      ...dto
    }: CreateBookReleaseDto,

    attrs: UpsertResourceAttrs = {},
  ): Promise<BookReleaseEntity> {
    const {
      upsertResources = false,
      entityManager = <any> BookReleaseEntity,
    } = attrs;

    const {
      connection,
      publisherService,
      availabilityService,
      imageAttachmentService,
    } = this;

    const upsertParams = {
      entityManager,
      connection,
      Entity: BookReleaseEntity,
      data: new BookReleaseEntity(
        {
          ...dto,
          publisherId: publisherId ?? (
            await (publisher && publisherService.upsert(publisher, attrs))
          )?.id,
        },
      ),
    };

    const releaseEntity = await upsert(
      {
        ...upsertParams,
        primaryKey: 'isbn',
      },
    );

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
      entityManager,
    );

    if (childReleases) {
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
        attrs,
      );
    }

    await runInPostHookIfPresent(
      {
        transactionManager: entityManager,
      },
      async (hookEntityManager) => {
        const fetchCover = async () => R.values(
          await imageAttachmentService.fetchAndCreateScaled(
            {
              destSubDir: `cover/${releaseEntity.id}`,
              sizes: BookReleaseService.COVER_IMAGE_SIZES,
              dto: cover,
            },
            hookEntityManager,
          ),
        );

        if (upsertResources) {
          releaseEntity.cover = await fetchCover();
          await hookEntityManager.save(
            new BookReleaseEntity(
              {
                id: publisher.id,
                cover: releaseEntity.cover,
              },
            ),
          );
        } else {
          const shouldFetchCover = !!cover?.originalUrl && !(await checkIfExists(
            {
              entityManager: this.entityManager,
              tableName: BookReleaseEntity.coverTableName,
              where: {
                bookReleaseId: releaseEntity.id,
              },
            },
          ));

          if (!shouldFetchCover)
            return;

          releaseEntity.cover = await fetchCover();
          await imageAttachmentService.directInsertToTable(
            {
              entityManager: hookEntityManager,
              coverTableName: BookReleaseEntity.coverTableName,
              images: releaseEntity.cover,
              fields: {
                bookReleaseId: releaseEntity.id,
              },
            },
          );
        }
      },
    );

    return releaseEntity;
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
    return sequential(
      dtos.map(
        (item) => () => Promise.resolve(
          this.upsert(
            item,
            attrs,
          ),
        ),
      ),
    );
  }
}
