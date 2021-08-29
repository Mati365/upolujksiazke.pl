import {Connection, EntityManager} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageAttachmentService, ImageResizeConfig} from '@server/modules/attachment/services';
import {ImageResizeSize} from '@shared/types';

import {RemoteArticleEntity} from '../entity/RemoteArticle.entity';
import {CreateRemoteArticleDto} from '../dto/CreateRemoteArticle.dto';

@Injectable()
export class RemoteArticleService {
  static readonly COVER_IMAGE_SIZES = Object.freeze<ImageResizeConfig>(
    {
      THUMB: new ImageResizeSize(200, null),
      PREVIEW: new ImageResizeSize(400, null),
      BIG: new ImageResizeSize(500, null),
    },
  );

  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Remove multiple articles at once
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof RemoteArticleService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await RemoteArticleEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['cover'],
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
          await imageAttachmentService.delete(entity.cover as any[], transaction);

        await transaction.remove(entities);
      },
    );
  }

  /**
   * Creates or updates article
   *
   * @param {CreateRemoteArticleDto} {cover, ...dto}
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<RemoteArticleEntity>}
   * @memberof RemoteArticleService
   */
  async upsert(
    {cover, ...dto}: CreateRemoteArticleDto,
    attrs: UpsertResourceAttrs = {},
  ): Promise<RemoteArticleEntity> {
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const {connection, imageAttachmentService} = this;
    const executor = async (transaction: EntityManager) => {
      const article = await upsert(
        {
          connection,
          constraint: 'scrapper_article_unique_remote_website',
          entityManager: transaction,
          Entity: RemoteArticleEntity,
          data: new RemoteArticleEntity(dto),
        },
      );

      if (cover?.originalUrl) {
        await imageAttachmentService.upsertImage(
          {
            entityManager: transaction,
            entity: article,
            resourceColName: 'cover',
            image: cover,
            manyToMany: {
              tableName: RemoteArticleEntity.coverTableName,
              idEntityColName: 'scrapperArticleId',
            },
            fetcher: {
              destSubDir: `article/${article.id}`,
              sizes: RemoteArticleService.COVER_IMAGE_SIZES,
            },
            upsertResources,
          },
        );
      }

      return article;
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
