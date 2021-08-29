import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageAttachmentService} from '@server/modules/attachment/services';
import {BrandEntity} from './entity/Brand.entity';
import {CreateBrandDto} from './dto/CreateBrand.dto';

@Injectable()
export class BrandService {
  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

  /**
   * Finds one brand by id
   *
   * @param {number} id
   * @return {Promise<BrandEntity>}
   * @memberof BrandService
   */
  async findOne(id: number): Promise<BrandEntity> {
    return BrandEntity.findOne(
      id,
      {
        relations: ['website', 'logo', 'logo.attachment'],
      },
    );
  }

  /**
   * Remove multiple brands
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BrandService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await BrandEntity.findByIds(
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
   * @param {CreateBrandDto} {logo, ...dto}
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<BrandEntity>}
   * @memberof BrandService
   */
  async upsert(
    {logo, ...dto}: CreateBrandDto,
    attrs: UpsertResourceAttrs = {},
  ): Promise<BrandEntity> {
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const {connection, imageAttachmentService} = this;
    const executor = async (transaction: EntityManager) => {
      const brand = await upsert(
        {
          connection,
          entityManager: transaction,
          Entity: BrandEntity,
          primaryKey: 'parameterizedName',
          data: new BrandEntity(dto),
        },
      );

      await imageAttachmentService.upsertImage(
        {
          entityManager: transaction,
          entity: brand,
          resourceColName: 'logo',
          image: logo,
          manyToMany: {
            tableName: BrandEntity.logoTableName,
            idEntityColName: 'brandsId',
          },
          fetcher: {
            destSubDir: `brand/${brand.id}`,
            sizes: BrandEntity.LOGO_IMAGE_SIZES,
          },
          upsertResources,
        },
      );

      return brand;
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
