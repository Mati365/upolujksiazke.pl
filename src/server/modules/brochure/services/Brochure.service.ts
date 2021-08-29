import * as R from 'ramda';
import {Injectable, Logger} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {
  forwardTransaction,
  runTransactionWithPostHooks,
  upsert,
} from '@server/common/helpers/db';

import {BrandService} from '@server/modules/brand/Brand.service';
import {TagService} from '@server/modules/tag/Tag.service';

import {CreateBrochureDto} from '../dto/CreateBrochure.dto';
import {BrochureEntity} from '../entity/Brochure.entity';
import {BrochurePageService} from '../modules/brochure-page/BrochurePage.service';
import {CreateBrochurePageDto} from '../modules/brochure-page/dto/BrochurePage.dto';
import {EsBrochureIndex} from '../indices/EsBrochure.index';

@Injectable()
export class BrochureService {
  private readonly logger = new Logger(BrochureService.name);

  constructor(
    private readonly connection: Connection,
    private readonly pageService: BrochurePageService,
    private readonly brandService: BrandService,
    private readonly tagService: TagService,
    private readonly brochureEsIndex: EsBrochureIndex,
  ) {}

  /**
   * Remove multiple brochures
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BrochureService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      pageService,
      brochureEsIndex,
    } = this;

    const entities = await BrochureEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['pages'],
        },
      },
    );

    const executor = async (transaction: EntityManager) => {
      for await (const entity of entities) {
        await pageService.delete(entity.pages as any[], transaction);
      }

      await transaction.remove(entities);
    };

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      executor,
    );

    await brochureEsIndex.deleteEntities(ids);
  }

  /**
   * Upserts brochure record
   *
   * @param {CreateBrochureDto} dto
   * @return {Promise<BrochureEntity>}
   * @memberof BrochureService
   */
  async upsert(
    {
      pages, brand,
      brandId, websiteId,
      ...dto
    }: CreateBrochureDto,
    {
      reindex = true,
    }: {
      reindex?: boolean,
    } = {},
  ): Promise<BrochureEntity> {
    const {
      logger,
      connection,
      pageService,
      brandService,
      tagService,
      brochureEsIndex,
    } = this;

    if (R.isNil(websiteId)) {
      logger.error('Missing website id!');
      return null;
    }

    if (!pages?.length)
      return null;

    const result = await runTransactionWithPostHooks(connection, async (transaction) => {
      const entity = new BrochureEntity(
        {
          ...dto,
          websiteId,
          totalPages: pages.length,
          tags: await tagService.upsert(dto.tags, transaction),
          brandId: brandId ?? (await brandService.upsert(
            {
              ...brand,
              websiteId,
            },
            {
              entityManager: transaction,
            },
          ))?.id,
        },
      );

      const brochure = await upsert(
        {
          connection,
          entityManager: transaction,
          Entity: BrochureEntity,
          constraint: 'brochure_unique_remote',
          data: entity,
        },
      );

      await pageService.upsertList(
        pages.map((pageDto) => new CreateBrochurePageDto(
          {
            ...pageDto,
            brochureId: brochure.id,
          },
        )),
        {
          entityManager: transaction,
        },
      );

      return brochure;
    });

    if (reindex)
      await brochureEsIndex.reindexEntity(result.id);

    return result;
  }
}
