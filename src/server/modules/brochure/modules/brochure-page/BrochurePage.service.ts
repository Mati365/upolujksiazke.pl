import {Injectable} from '@nestjs/common';
import pMap from 'p-map';
import {
  In,
  Connection,
  EntityManager,
  SelectQueryBuilder,
} from 'typeorm';

import {
  forwardTransaction,
  groupRawMany,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageAttachmentService} from '@server/modules/attachment/services';
import {BrochurePageEntity} from './BrochurePage.entity';
import {CreateBrochurePageDto} from './dto/BrochurePage.dto';
import {BrochureGroupedSelectAttrs} from '../../shared/types';

@Injectable()
export class BrochurePageService {
  public static readonly DEFAULT_SELECT_FIELDS = [
    'page.id', 'page.index', 'page.brochureId',
    'image.version', 'image.ratio', 'image.nsfw', 'attachment.file',
  ];

  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Create basic query
   *
   * @param {Object} attrs
   * @return {SelectQueryBuilder<BrochurePageEntity>}
   * @memberof BrochurePageService
   */
  createDefaultQuery(
    {
      select = BrochurePageService.DEFAULT_SELECT_FIELDS,
    }: {
      select?: string[],
    } = {},
  ): SelectQueryBuilder<BrochurePageEntity> {
    return (
      BrochurePageEntity
        .createQueryBuilder('page')
        .innerJoin('page.image', 'image')
        .innerJoin('image.attachment', 'attachment')
        .select(select)
    );
  }

  /**
   * Find pages for multiple brochures
   *
   * @param {BrochureGroupedSelectAttrs} attrs
   * @return {Promise<Record<string, BrochurePageEntity[]>>}
   * @memberof BrochurePageService
   */
  async findBrochuresPages(
    {
      brochuresIds,
      select = BrochurePageService.DEFAULT_SELECT_FIELDS,
    }: BrochureGroupedSelectAttrs,
  ): Promise<Record<string, BrochurePageEntity[]>> {
    const items = await (
      this
        .createDefaultQuery(
          {
            select,
          },
        )
        .where(
          {
            brochureId: In(brochuresIds),
          },
        )
        .getMany()
    );

    return groupRawMany(
      {
        items,
        key: 'brochureId',
      },
    );
  }

  /**
   * Remove multiple brochure pages at once
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BrochurePageService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await BrochurePageEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['image'],
        },
      },
    );

    await forwardTransaction({connection, entityManager}, async (transaction) => {
      for await (const entity of entities)
        await imageAttachmentService.delete(entity.image as any[], transaction);

      await transaction.remove(entities);
    });
  }

  /**
   * Upsert single page
   *
   * @param {CreateBrochurePageDto} dto
   * @param {UpsertResourceAttrs} [attrs={}]
   * @return {Promise<BrochurePageEntity>}
   * @memberof BrochurePageService
   */
  async upsert(
    {image, ...dto}: CreateBrochurePageDto,
    attrs: UpsertResourceAttrs = {},
  ): Promise<BrochurePageEntity> {
    const {connection, imageAttachmentService} = this;
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const executor = async (transaction: EntityManager) => {
      const page = await upsert(
        {
          connection,
          entityManager: transaction,
          constraint: 'unique_page_index',
          Entity: BrochurePageEntity,
          data: new BrochurePageEntity(dto),
        },
      );

      await imageAttachmentService.upsertImage(
        {
          entityManager: transaction,
          entity: page,
          resourceColName: 'image',
          image,
          manyToMany: {
            tableName: BrochurePageEntity.imageTableName,
            idEntityColName: 'brochurePageId',
          },
          fetcher: {
            destSubDir: `brochure/${dto.brochureId}/page/${page.id}`,
            sizes: BrochurePageEntity.IMAGE_SIZES,
          },
          upsertResources,
        },
      );

      return page;
    };

    return forwardTransaction(
      {
        connection,
        entityManager,
      },
      executor,
    );
  }

  /**
   * Create array of pages
   *
   * @param {CreateBrochurePageDto[]} dtos
   * @param {UpsertResourceAttrs} [attrs={}]
   * @return {Promise<BrochurePageEntity[]>}
   * @memberof BrochurePageService
   */
  async upsertList(
    dtos: CreateBrochurePageDto[],
    attrs: UpsertResourceAttrs = {},
  ): Promise<BrochurePageEntity[]> {
    return pMap(
      dtos,
      (dto) => this.upsert(dto, attrs),
      {
        concurrency: 1,
      },
    );
  }
}
