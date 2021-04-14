import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {extractHostname} from '@shared/helpers/urlExtract';
import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageResizeSize} from '@shared/types';
import {ImageAttachmentService, ImageResizeConfig} from '@server/modules/attachment/services';
import {RemoteWebsiteEntity} from '../entity/RemoteWebsite.entity';
import {CreateRemoteWebsiteDto} from '../dto/CreateRemoteWebsite.dto';

@Injectable()
export class RemoteWebsiteService {
  static readonly LOGO_IMAGE_SIZES = Object.freeze<ImageResizeConfig>(
    {
      SMALL_THUMB: new ImageResizeSize('', 16),
      THUMB: new ImageResizeSize('', 24),
      PREVIEW: new ImageResizeSize('', 32),
    },
  );

  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Search signle record by plain URL
   *
   * @param {string} url
   * @returns
   * @memberof RemoteWebsiteService
   */
  findByFullURL(url: string) {
    return (
      RemoteWebsiteEntity
        .createQueryBuilder()
        .where(
          {
            hostname: extractHostname(url),
          },
        )
        .limit(1)
        .getOne()
    );
  }

  /**
   * Delete array of websites
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof RemoteWebsiteService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await RemoteWebsiteEntity.findByIds(
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
   * Create or updates websites
   *
   * @param {CreateRemoteWebsiteDto} {logo, ...dto}
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<RemoteWebsiteEntity>}
   * @memberof RemoteWebsiteService
   */
  async upsert(
    {logo, ...dto}: CreateRemoteWebsiteDto,
    attrs: UpsertResourceAttrs = {},
  ): Promise<RemoteWebsiteEntity> {
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const {connection, imageAttachmentService} = this;
    const executor = async (transaction: EntityManager) => {
      const website = await upsert(
        {
          connection,
          primaryKey: 'url',
          entityManager: transaction,
          Entity: RemoteWebsiteEntity,
          data: new RemoteWebsiteEntity(dto),
        },
      );

      if (logo?.originalUrl) {
        await imageAttachmentService.upsertImage(
          {
            entityManager: transaction,
            entity: website,
            resourceColName: 'logo',
            image: logo,
            manyToMany: {
              tableName: RemoteWebsiteEntity.logoTableName,
              idEntityColName: 'scrapperWebsiteId',
            },
            fetcher: {
              destSubDir: `favicon/${website.id}`,
              sizes: RemoteWebsiteService.LOGO_IMAGE_SIZES,
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
