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
  PostHookEntityManager,
} from '@server/common/helpers/db';

import {ImageAttachmentService} from '@server/modules/attachment/services';
import {ImageAttachmentEntity, ImageVersion} from '@server/modules/attachment/entity/ImageAttachment.entity';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookPublisherService} from '../publisher/BookPublisher.service';

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
      ...dto
    }: CreateBookReleaseDto,
    entityManager: PostHookEntityManager = <any> BookReleaseEntity,
  ): Promise<BookReleaseEntity> {
    const {
      connection,
      publisherService,
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
            await (publisher && publisherService.upsert(publisher, entityManager))
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
        entityManager,
      );
    }

    if (cover?.originalUrl) {
      await runInPostHookIfPresent(entityManager, async (hookEntityManager) => {
        const coverAlreadyCached = await checkIfExists(
          {
            entityManager: hookEntityManager,
            tableName: 'book_release_cover_image_attachments',
            where: {
              bookReleaseId: releaseEntity.id,
            },
          },
        );

        if (!coverAlreadyCached) {
          releaseEntity.cover = R.values(
            await imageAttachmentService.fetchAndCreateScaled(
              {
                destSubDir: `cover/${releaseEntity.id}`,
                sizes: BookReleaseService.COVER_IMAGE_SIZES,
                dto: cover,
              },
              hookEntityManager,
            ),
          );

          await hookEntityManager.save(
            new BookReleaseEntity(
              {
                id: releaseEntity.id,
                cover: releaseEntity.cover.map(
                  (item) => new ImageAttachmentEntity(
                    {
                      id: item.id,
                    },
                  ),
                ),
              },
            ),
          );
        }
      });
    }

    return releaseEntity;
  }

  /**
   * Create or update array of books releases
   *
   * @param {CreateBookReleaseDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookReleaseEntity[]>}
   * @memberof BookReleaseService
   */
  async upsertList(dtos: CreateBookReleaseDto[], entityManager?: EntityManager): Promise<BookReleaseEntity[]> {
    if (!dtos?.length)
      return [];

    // do not use Promise.all! It breaks typeorm!
    return sequential(
      dtos.map(
        (item) => () => Promise.resolve(
          this.upsert(item, entityManager),
        ),
      ),
    );
  }
}
