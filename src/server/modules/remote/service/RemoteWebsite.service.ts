import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {
  findObjValue,
  shallowMemoizeOneCall,
  extractHostname,
  uniqFlatHashByProp,
} from '@shared/helpers';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {Result, errIfNil} from '@shared/monads/Result';
import {ImageResizeSize, ImageVersion} from '@shared/types';
import {ImageAttachmentService, ImageResizeConfig} from '@server/modules/attachment/services';
import {RemoteWebsiteEntity} from '../entity/RemoteWebsite.entity';
import {CreateRemoteWebsiteDto} from '../dto/CreateRemoteWebsite.dto';

type WebsitesCache = {
  [id: string]: RemoteWebsiteEntity,
};

type RecordWithWebsite = {
  websiteId: number | string,
  website: RemoteWebsiteEntity,
};

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
   * Returns flat hash of websites list, it is safe to load
   * all into memory, there is no so many of them
   *
   * @memberof RemoteWebsiteService
   */
  getCachedWebsitesMap = shallowMemoizeOneCall(async () => {
    const result = await (
      RemoteWebsiteEntity
        .createQueryBuilder('website')
        .addSelect(['logo', 'attachment'])
        .leftJoin('website.logo', 'logo', `logo.version = '${ImageVersion.SMALL_THUMB}'`)
        .leftJoin('logo.attachment', 'attachment')
        .getMany()
    );

    return uniqFlatHashByProp('id', result);
  });

  /**
   * If function returns err() monad result cache is flushed
   * and websites are hash is regenerated. It can happen if
   * scrapper adds new website in meantime
   *
   * @template T
   * @param {(cache: WebsitesCache) => Result<T, true>} fn
   * @return {T}
   * @memberof RemoteWebsiteService
   */
  async lookupOrInvalidateWebsiteCache<T>(fn: (cache: WebsitesCache) => Result<T, void>): Promise<T> {
    return fn(await this.getCachedWebsitesMap()).match(
      {
        ok: R.identity,
        err: () => {
          this.getCachedWebsitesMap.clearCache();
          return null;
        },
      },
    );
  }

  /**
   * Assigns website attributes to list. It is faster than
   * traditional way to load websites using join, it performs
   * only one call to SQL and caches all websites into cache
   *
   *
   * @template T
   * @param {T[]} entities
   * @return {Promise<T[]>}
   * @memberof RemoteWebsiteService
   */
  async preloadWebsitesToEntities<T extends RecordWithWebsite>(entities: T[]): Promise<T[]> {
    const websites = await this.getCachedWebsitesMap();
    entities.forEach((entity) => {
      entity.website = websites[entity.websiteId] ?? null;
    });

    return entities;
  }

  /**
   * Search signle record by plain URL
   *
   * @param {string} url
   * @returns
   * @memberof RemoteWebsiteService
   */
  async findByFullURL(url: string) {
    const hostname = extractHostname(url);
    const cacheResult = await this.lookupOrInvalidateWebsiteCache(
      (cache) => errIfNil(
        findObjValue(
          R.propEq('hostname', hostname),
          cache,
        ),
      ),
    );

    return cacheResult || (
      RemoteWebsiteEntity
        .createQueryBuilder()
        .where(
          {
            hostname,
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
