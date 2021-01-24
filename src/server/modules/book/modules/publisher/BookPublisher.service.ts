import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {
  checkIfExists,
  forwardTransaction,
  upsert,
} from '@server/common/helpers/db';

import {Size} from '@shared/types';
import {ImageAttachmentEntity, ImageVersion} from '@server/modules/attachment/entity';
import {ImageAttachmentService} from '@server/modules/attachment/services';
import {BookPublisherEntity} from './BookPublisher.entity';
import {CreateBookPublisherDto} from './dto/BookPublisher.dto';

@Injectable()
export class BookPublisherService {
  static readonly LOGO_IMAGE_SIZES: Partial<Record<ImageVersion, Size>> = Object.freeze(
    {
      SMALL_THUMB: new Size(78, null),
      THUMB: new Size(147, null),
      PREVIEW: new Size(220, null),
    },
  );

  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Remove single book publisher
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookPublisherService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await BookPublisherEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['logo'],
        },
      },
    );

    await forwardTransaction({connection, entityManager}, async (transaction) => {
      for await (const entity of entities)
        await imageAttachmentService.delete(entity.logo as any[], transaction);

      await transaction.remove(entities);
    });
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateBookPublisherDto} {logo, ...dto}
   * @param {EntityManager} [entityManager=<any> BookPublisherEntity]
   * @returns {Promise<BookPublisherEntity>}
   * @memberof BookPublisherService
   */
  async upsert(
    {logo, ...dto}: CreateBookPublisherDto,
    entityManager: EntityManager = <any> BookPublisherEntity,
  ): Promise<BookPublisherEntity> {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const publisher = await upsert(
      {
        entityManager,
        connection,
        Entity: BookPublisherEntity,
        primaryKey: 'name',
        data: new BookPublisherEntity(dto),
      },
    );

    if (logo?.originalUrl) {
      const logoAlreadyCached = await checkIfExists(
        {
          entityManager,
          tableName: 'book_publisher_logo_image_attachments',
          where: {
            bookPublisherId: publisher.id,
          },
        },
      );

      if (!logoAlreadyCached) {
        publisher.logo = R.values(
          await imageAttachmentService.fetchAndCreateScaled(
            {
              destSubDir: 'logo',
              sizes: BookPublisherService.LOGO_IMAGE_SIZES,
              dto: logo,
            },
            entityManager,
          ),
        );

        await entityManager.save(
          new BookPublisherEntity(
            {
              id: publisher.id,
              logo: publisher.logo.map(
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
    }

    return publisher;
  }
}
