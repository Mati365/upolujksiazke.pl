import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import sequential from 'promise-sequential';
import * as R from 'ramda';

import {Size} from '@shared/types';
import {
  forwardTransaction,
  upsert,
} from '@server/common/helpers/db';

import {ImageAttachmentService} from '@server/modules/attachment/services';
import {ImageAttachmentEntity, ImageVersion} from '@server/modules/attachment/entity/ImageAttachment.entity';
import {RemoteRecordService} from '@server/modules/remote/service/RemoteRecord.service';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookPublisherService} from '../publisher/BookPublisher.service';
import {BookVolumeService} from '../volume/BookVolume.service';

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
    private readonly volumeService: BookVolumeService,
    private readonly remoteRecordService: RemoteRecordService,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Remove single book release
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
      for await (const entity of entities) {
        await imageAttachmentService.delete(
          entity.cover as any[],
          transaction,
        );
      }

      await transaction.remove(entities);
    });
  }

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  create({cover, ...dto}: CreateBookReleaseDto): Promise<BookReleaseEntity> {
    return BookReleaseEntity.save(
      BookReleaseEntity.create(dto),
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateRemoteRecordDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  async upsert(
    {
      cover,
      volumeId, volume,
      remoteDescriptionId, remoteDescription,
      publisher, publisherId,
      ...dto
    }: CreateBookReleaseDto,

    entityManager: EntityManager = <any> BookReleaseEntity,
  ): Promise<BookReleaseEntity> {
    const {
      connection,
      publisherService,
      remoteRecordService,
      volumeService,
      imageAttachmentService,
    } = this;

    const upsertParams = {
      entityManager,
      connection,
      Entity: BookReleaseEntity,
      data: new BookReleaseEntity(
        {
          ...dto,

          volumeId: volumeId ?? (
            await (volume && volumeService?.upsert(volume, entityManager))
          )?.id,

          remoteDescriptionId: remoteDescriptionId ?? (
            await (remoteDescription && remoteRecordService?.upsert(remoteDescription, entityManager))
          )?.id,

          publisherId: publisherId ?? (
            await (publisher && publisherService.upsert(publisher, entityManager))
          )?.id,
        },
      ),
    };

    const releaseEntity = await (async () => {
      try {
        return await upsert(
          {
            ...upsertParams,
            primaryKey: 'remoteDescriptionId',
          },
        );
      } catch (e) {
        return upsert(
          {
            ...upsertParams,
            constraint: 'book_release_unique_publisher_edition',
          },
        );
      }
    })();

    const releaseCover = await (
      entityManager
        .createQueryBuilder('book_release_cover_image_attachments', 'c')
        .select('c.bookReleaseId')
        .where(
          {
            bookReleaseId: releaseEntity.id,
          },
        )
        .limit(1)
        .execute()
    );

    /**
     * @todo
     *  - Add rollback changes support!
     *  - Add callback support
     */

    if (!releaseCover?.length) {
      releaseEntity.cover = R.values(
        await imageAttachmentService.fetchAndCreateScaled(
          {
            destSubDir: 'cover',
            sizes: BookReleaseService.COVER_IMAGE_SIZES,
            dto: cover,
          },
          entityManager,
        ),
      );

      await entityManager.save(
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
