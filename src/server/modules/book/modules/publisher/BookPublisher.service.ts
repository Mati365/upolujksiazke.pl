import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {parameterize} from '@shared/helpers/parameterize';
import {
  checkIfExists,
  forwardTransaction,
  runInPostHookIfPresent,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {Size} from '@shared/types';
import {ImageVersion} from '@server/modules/attachment/entity';
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
    private readonly entityManager: EntityManager,
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
      entityManager = <any> BookPublisherEntity,
    } = attrs;

    const {
      connection,
      imageAttachmentService,
    } = this;

    const publisher = await upsert(
      {
        entityManager,
        connection,
        Entity: BookPublisherEntity,
        primaryKey: 'parameterizedName',
        data: new BookPublisherEntity(dto),
      },
    );

    await runInPostHookIfPresent(
      {
        transactionManager: entityManager,
      },
      async (hookEntityManager) => {
        const fetchLogo = async () => R.values(
          await imageAttachmentService.fetchAndCreateScaled(
            {
              destSubDir: `logo/${publisher.id}`,
              sizes: BookPublisherService.LOGO_IMAGE_SIZES,
              dto: logo,
            },
            hookEntityManager,
          ),
        );

        if (upsertResources) {
          publisher.logo = await fetchLogo();
          await hookEntityManager.save(
            new BookPublisherEntity(
              {
                id: publisher.id,
                logo: publisher.logo,
              },
            ),
          );
        } else {
          const shouldFetchLogo = !!logo?.originalUrl && !(await checkIfExists(
            {
              entityManager: this.entityManager,
              tableName: BookPublisherEntity.coverTableName,
              where: {
                bookPublisherId: publisher.id,
              },
            },
          ));

          if (!shouldFetchLogo)
            return;

          publisher.logo = await fetchLogo();
          await imageAttachmentService.directInsertToTable(
            {
              coverTableName: BookPublisherEntity.coverTableName,
              images: publisher.logo,
              entityManager: hookEntityManager,
              fields: {
                bookPublisherId: publisher.id,
              },
            },
          );
        }
      },
    );

    return publisher;
  }
}
