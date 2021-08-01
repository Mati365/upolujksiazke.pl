import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import pMap from 'p-map';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageAttachmentService} from '@server/modules/attachment/services';
import {BrochurePageEntity} from './BrochurePage.entity';
import {CreateBrochurePageDto} from './dto/BrochurePage.dto';

@Injectable()
export class BrochurePageService {
  constructor(
    private readonly connection: Connection,
    private readonly imageAttachmentService: ImageAttachmentService,
  ) {}

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
      const publisher = await upsert(
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
          entity: publisher,
          resourceColName: 'image',
          image,
          manyToMany: {
            tableName: BrochurePageEntity.imageTableName,
            idEntityColName: 'brochurePageId',
          },
          fetcher: {
            destSubDir: `brochure/page/${publisher.id}`,
            sizes: BrochurePageEntity.IMAGE_SIZES,
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
