import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {Size} from '@shared/types';
import {ImageAttachmentService, ImageResizeConfig} from '@server/modules/attachment/services';
import {BookPublisherEntity} from './BookPublisher.entity';
import {CreateBookPublisherDto} from './dto/BookPublisher.dto';

@Injectable()
export class BookPublisherService {
  static readonly LOGO_IMAGE_SIZES: ImageResizeConfig = Object.freeze(
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
   * Finds publishers with similar name
   *
   * @param {string} name
   * @param {number} [similarity=2]
   * @returns
   * @memberof BookPublisherService
   */
  createQueryWithSimilarNames(name: string, similarity: number = 2) {
    return (
      BookPublisherEntity
        .createQueryBuilder()
        .where(
          'levenshtein("parameterizedName", :name) <= :similarity',
          {
            name: parameterize(name),
            similarity,
          },
        )
    );
  }

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

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      async (transaction) => {
        for await (const entity of entities)
          await imageAttachmentService.delete(entity.logo as any[], transaction);

        await transaction.remove(entities);
      },
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateBookPublisherDto} {logo, ...dto}
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<BookPublisherEntity>}
   * @memberof BookPublisherService
   */
  async upsert(
    {logo, ...dto}: CreateBookPublisherDto,
    attrs: UpsertResourceAttrs = {},
  ): Promise<BookPublisherEntity> {
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const {connection, imageAttachmentService} = this;
    const executor = async (transaction: EntityManager) => {
      const publisher = await upsert(
        {
          connection,
          entityManager: transaction,
          Entity: BookPublisherEntity,
          primaryKey: 'parameterizedName',
          data: new BookPublisherEntity(dto),
        },
      );

      await imageAttachmentService.upsertImage(
        {
          entityManager: transaction,
          entity: publisher,
          resourceColName: 'logo',
          image: logo,
          manyToMany: {
            tableName: BookPublisherEntity.coverTableName,
            idEntityColName: 'bookPublisherId',
          },
          fetcher: {
            destSubDir: `logo/${publisher.id}`,
            sizes: BookPublisherService.LOGO_IMAGE_SIZES,
          },
          upsertResources,
        },
      );

      return publisher;
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
