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
      const website = await upsert(
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
            entity: website,
            resourceColName: 'cover',
            image: cover,
            manyToMany: {
              tableName: RemoteArticleEntity.coverTableName,
              idEntityColName: 'scrapperArticleId',
            },
            fetcher: {
              destSubDir: `article/${website.id}`,
              sizes: RemoteArticleService.COVER_IMAGE_SIZES,
            },
            upsertResources,
          },
        );
      }

      return website;
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
