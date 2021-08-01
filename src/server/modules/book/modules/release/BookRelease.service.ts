import {Injectable, Inject, forwardRef} from '@nestjs/common';
import {Connection, EntityManager, In, SelectQueryBuilder} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {objPropsToPromise, uniqFlatHashByProp} from '@shared/helpers';
import {
  forwardTransaction,
  groupRawMany,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageResizeSize} from '@shared/types';
import {ImageVersion} from '@shared/enums';

import {
  AttachmentEntity,
  ImageAttachmentEntity,
} from '@server/modules/attachment/entity';

import {ImageAttachmentService, ImageResizeConfig} from '@server/modules/attachment/services';
import {RemoteWebsiteService} from '@server/modules/remote/service';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '../availability/dto/CreateBookAvailability.dto';
import {CreateBookReviewDto} from '../review/dto/CreateBookReview.dto';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookPublisherService} from '../publisher/BookPublisher.service';
import {BookAvailabilityService} from '../availability/BookAvailability.service';
import {BookReviewService} from '../review/BookReview.service';
import {BookAvailabilityEntity} from '../availability/BookAvailability.entity';
import {BookPublisherEntity} from '../publisher/BookPublisher.entity';
import {BookGroupedSelectAttrs} from '../../shared/types';

export type UpsertBookReleaseAttrs = UpsertResourceAttrs & {
  reindexBook?: boolean,
};

@Injectable()
export class BookReleaseService {
  static readonly COVER_IMAGE_SIZES = Object.freeze<ImageResizeConfig>(
    {
      SMALL_THUMB: new ImageResizeSize(78, 117),
      THUMB: new ImageResizeSize(147, 221),
      PREVIEW: new ImageResizeSize(220, 330),
      BIG: new ImageResizeSize(320, 484),
    },
  );

  constructor(
    private readonly connection: Connection,

    @Inject(forwardRef(() => BookReviewService))
    private readonly reviewsService: BookReviewService,
    private readonly publisherService: BookPublisherService,
    private readonly availabilityService: BookAvailabilityService,
    private readonly imageAttachmentService: ImageAttachmentService,
    private readonly remoteWebsiteService: RemoteWebsiteService,
  ) {}

  /**
   * Selects releases for multiple books at once
   *
   * @param {Object} attrs
   * @returns
   * @memberof BookReleaseService
   */
  async findBooksReleases(
    {
      booksIds,
      select,
      queryMapperFn = R.identity,
    }: BookGroupedSelectAttrs & {
      queryMapperFn?(query: SelectQueryBuilder<BookReleaseEntity>): SelectQueryBuilder<BookReleaseEntity>,
    },
  ) {
    const query = (
      BookReleaseEntity
        .createQueryBuilder('r')
        .select(['r.bookId as "bookId"', ...select])
        .where(
          {
            bookId: In(booksIds),
          },
        )
    );

    const items = await queryMapperFn(query).getRawMany();
    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (
          {
            p_id: pID,
            p_name: pName,
            p_parameterizedName: pParameterizedName,
            id,
            isbn,
            bookId,
          },
        ) => new BookReleaseEntity(
          {
            id,
            isbn,
            bookId,
            ...!R.isNil(pID) && {
              publisher: new BookPublisherEntity(
                {
                  id: pID,
                  name: pName,
                  parameterizedName: pParameterizedName,
                },
              ),
            },
          },
        ),
      },
    );
  }

  /**
   * Find prizes for books
   *
   * @param {number} bookId
   * @param {Object} attrs
   * @returns
   * @memberof BookCategoryService
   */
  async findBookReleases(
    {
      bookId,
      coversSizes,
    }: {
      bookId: number,
      coversSizes?: ImageVersion[],
    },
  ) {
    const {remoteWebsiteService} = this;
    const releases = await (
      BookReleaseEntity
        .createQueryBuilder('r')
        .select(
          [
            'r.id', 'r.publishDate', 'r.recordingLength',
            'r.lang', 'r.isbn', 'r.binding', 'r.format', 'r.type',
            'r.title', 'r.totalPages', 'r.protection', 'r.translator',
            'r.edition', 'r.weight',
            'p.id', 'p.name', 'p.parameterizedName',
          ],
        )
        .leftJoinAndSelect('r.publisher', 'p')
        .where(
          {
            bookId,
          },
        )
        .getMany()
    );

    const {covers, availability} = await objPropsToPromise(
      {
        availability: (async () => {
          const list = await (
            BookAvailabilityEntity
              .createQueryBuilder('a')
              .select(
                [
                  'a.id', 'a.releaseId', 'a.websiteId',
                  'a.prevPrice', 'a.price', 'a.inStock',
                  'a.totalRatings', 'a.avgRating', 'a.url',
                ],
              )
              .where(
                {
                  releaseId: In(R.pluck('id', releases)),
                },
              )
              .getMany()
          );

          return remoteWebsiteService.preloadWebsitesToEntities(list);
        })(),

        covers: (
          coversSizes && releases?.length > 0
            ? (
              ImageAttachmentEntity
                .createQueryBuilder('image')
                .select([
                  'image.version as "version"', 'attachment.file as "file"',
                  'rc.bookReleaseId as "releaseId"',
                ])
                .innerJoin(
                  BookReleaseEntity.coverTableName,
                  'rc',
                  'rc."bookReleaseId" IN (:...releasesIds) and "rc"."imageAttachmentsId" = "image"."id"',
                  {
                    releasesIds: R.pluck('id', releases),
                  },
                )
                .innerJoin('image.attachment', 'attachment')
                .where(
                  {
                    version: In(coversSizes),
                  },
                )
                .getRawMany<{version: ImageVersion, file: string, releaseId: number}>()
            )
            : null
        ),
      },
    );

    const releasesMap = uniqFlatHashByProp('id', releases);
    if (covers) {
      covers.forEach(({releaseId, file, version}) => {
        (releasesMap[releaseId].cover ||= []).push(
          new ImageAttachmentEntity(
            {
              version,
              attachment: new AttachmentEntity(
                {
                  file,
                },
              ),
            },
          ),
        );
      });
    }

    availability.forEach(
      (item) => {
        (releasesMap[item.releaseId].availability ??= []).push(item);
      },
    );

    return releases;
  }

  /**
   * Remove multiple book releases
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookReleaseService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      imageAttachmentService,
    } = this;

    const entities = await BookReleaseEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['cover'],
        },
      },
    );

    await forwardTransaction({connection, entityManager}, async (transaction) => {
      for await (const entity of entities)
        await imageAttachmentService.delete(entity.cover as any[], transaction);

      await transaction.remove(entities);
    });
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateRemoteRecordDto} dto
   * @param {UpsertBookReleaseAttrs} attrs
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  async upsert(
    {
      cover,
      childReleases,
      publisher, publisherId,
      reviews,
      availability,
      ...dto
    }: CreateBookReleaseDto,

    attrs: UpsertBookReleaseAttrs = {},
  ): Promise<BookReleaseEntity> {
    const {
      connection,
      publisherService,
      availabilityService,
      imageAttachmentService,
      reviewsService,
    } = this;

    const executor = async (transaction: EntityManager) => {
      const transactionAttrs: typeof attrs = {
        ...attrs,
        entityManager: transaction,
        reindexBook: attrs.reindexBook ?? true,
      };

      const releaseEntity = await upsert(
        {
          connection,
          primaryKey: 'isbn',
          entityManager: transaction,
          Entity: BookReleaseEntity,
          data: new BookReleaseEntity(
            {
              ...dto,
              publisherId: publisherId ?? (await (publisher && publisherService.upsert(
                publisher,
                transactionAttrs,
              )))?.id,
            },
          ),
        },
      );

      if (reviews?.length) {
        releaseEntity.reviews = await reviewsService.upsert(
          reviews.map((review) => new CreateBookReviewDto(
            {
              ...review,
              bookId: releaseEntity.bookId,
              releaseId: releaseEntity.id,
            },
          )),
          transactionAttrs,
        );
      }

      if (availability?.length) {
        releaseEntity.availability = await availabilityService.upsertList(
          availability.map(
            (item) => new CreateBookAvailabilityDto(
              {
                ...item,
                releaseId: releaseEntity.id,
              },
            ),
          ),
          transaction,
        );
      }

      if (childReleases?.length) {
        await this.upsertList(
          childReleases.map(
            (childDto) => new CreateBookReleaseDto(
              {
                ...childDto,
                bookId: releaseEntity.bookId,
                publisherId: releaseEntity.publisherId,
                parentReleaseId: releaseEntity.id,
              },
            ),
          ),
          transactionAttrs,
        );
      }

      await imageAttachmentService.upsertImage(
        {
          upsertResources: transactionAttrs.upsertResources,
          entityManager: transaction,
          entity: releaseEntity,
          resourceColName: 'cover',
          image: cover,
          manyToMany: {
            tableName: BookReleaseEntity.coverTableName,
            idEntityColName: 'bookReleaseId',
          },
          fetcher: {
            destSubDir: `cover/${releaseEntity.id}`,
            sizes: BookReleaseService.COVER_IMAGE_SIZES,
          },
        },
      );

      return releaseEntity;
    };

    return forwardTransaction(
      {
        connection,
        entityManager: attrs.entityManager,
      },
      executor,
    );
  }

  /**
   * Create or update array of books releases
   *
   * @param {CreateBookReleaseDto[]} dtos
   * @param {UpsertBookReleaseAttrs} [attrs={}]
   * @returns {Promise<BookReleaseEntity[]>}
   * @memberof BookReleaseService
   */
  async upsertList(
    dtos: CreateBookReleaseDto[],
    attrs: UpsertBookReleaseAttrs = {},
  ): Promise<BookReleaseEntity[]> {
    if (!dtos?.length)
      return [];

    // do not use Promise.all! It breaks typeorm!
    return forwardTransaction(
      {
        connection: this.connection,
        entityManager: attrs.entityManager,
      },
      (transaction) => pMap(
        dtos,
        (item) => this.upsert(
          item,
          {
            ...attrs,
            entityManager: transaction,
          },
        ),
        {
          concurrency: 1,
        },
      ),
    );
  }
}
