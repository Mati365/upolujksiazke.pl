import {Injectable} from '@nestjs/common';
import {Connection, EntityManager, In} from 'typeorm';
import * as R from 'ramda';

import {
  forwardTransaction,
  runTransactionWithPostHooks,
  upsert,
} from '@server/common/helpers/db';

import {TagService} from '../tag/Tag.service';
import {BookAuthorService} from './modules/author/BookAuthor.service';
import {BookReleaseService} from './modules/release/BookRelease.service';
import {BookCategoryService} from './modules/category';
import {BookAvailabilityService} from './modules/availability/BookAvailability.service';
import {BookVolumeService} from './modules/volume/BookVolume.service';
import {BookSeriesService} from './modules/series/BookSeries.service';
import {BookPrizeService} from './modules/prize/BookPrize.service';
import {BookKindService} from './modules/kind/BookKind.service';

import {CreateBookDto} from './dto/CreateBook.dto';
import {CreateBookReleaseDto} from './modules/release/dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from './modules/availability/dto/CreateBookAvailability.dto';
import {BookEntity} from './Book.entity';
import {BookVolumeEntity} from './modules/volume/BookVolume.entity';

@Injectable()
export class BookService {
  constructor(
    private readonly connection: Connection,
    private readonly tagService: TagService,
    private readonly authorService: BookAuthorService,
    private readonly releaseService: BookReleaseService,
    private readonly categoryService: BookCategoryService,
    private readonly availabilityService: BookAvailabilityService,
    private readonly volumeService: BookVolumeService,
    private readonly seriesService: BookSeriesService,
    private readonly prizeServices: BookPrizeService,
    private readonly kindService: BookKindService,
  ) {}

  /**
   * Remove single book release
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      availabilityService,
      releaseService,
    } = this;

    const entities = await BookEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['releases', 'availability'],
        },
      },
    );

    await forwardTransaction({connection, entityManager}, async (transaction) => {
      for await (const entity of entities) {
        await releaseService.delete(entity.releases as any[], transaction);
        await availabilityService.delete(entity.availability as any[], transaction);
      }

      const orphanVolumes = (
        await transaction
          .getRepository(BookVolumeEntity)
          .createQueryBuilder('v')
          .leftJoin(BookEntity, 'b', 'b.volumeId = v.id')
          .select(['b.id'])
          .where(
            {
              id: In(R.pluck('volumeId', entities)),
            },
          )
          .andWhere('b.id is null')
          .getMany()
      );

      await transaction.remove(
        [
          ...orphanVolumes,
          ...entities,
        ],
      );
    });
  }

  /**
   * Creates or updates single book
   *
   * @param {CreateBookDto} dto
   * @returns {Promise<BookEntity>}
   * @memberof BookService
   */
  async upsert(dto: CreateBookDto): Promise<BookEntity> {
    const {
      connection,
      availabilityService,
    } = this;

    return runTransactionWithPostHooks(connection, async (transaction) => {
      const {
        tagService, authorService,
        volumeService, releaseService,
        categoryService, seriesService,
        prizeServices, kindService,
      } = this;

      const [
        kind,
        volume,
        series,
        prizes,
        authors,
        tags,
        categories,
      ] = (
        [
          dto.kind && (await kindService.upsert([dto.kind]))[0],
          dto.volume && await volumeService.upsert(dto.volume),
          dto.series && await seriesService.upsert(dto.series),
          dto.prizes && await prizeServices.upsert(dto.prizes),
          await authorService.upsert(dto.authors, transaction),
          await tagService.upsert(dto.tags, transaction),
          await categoryService.upsert(dto.categories, transaction),
        ]
      );

      let book: BookEntity = null;
      if (R.isNil(dto.id)) {
        book = await upsert(
          {
            connection,
            entityManager: transaction,
            primaryKey: 'parameterizedTitle',
            Entity: BookEntity,
            data: new BookEntity(
              {
                defaultTitle: dto.defaultTitle,
                originalTitle: dto.originalTitle,
                originalLang: dto.originalLang,
                originalPublishDate: dto.originalPublishDate,
                ...dto.kindId ? {kindId: dto.kindId} : {kind},
                ...dto.volumeId ? {volumeId: dto.volumeId} : {volume},
                series,
                prizes,
                authors,
                tags,
                categories,
              },
            ),
          },
        );
      } else {
        book = new BookEntity(
          {
            id: dto.id,
          },
        );
      }

      await availabilityService.upsertList(
        dto.availability.map(
          (availability) => new CreateBookAvailabilityDto(
            {
              ...availability,
              bookId: book.id,
            },
          ),
        ),
        transaction,
      );

      await releaseService.upsertList(
        dto.releases.map(
          (release) => new CreateBookReleaseDto(
            {
              ...release,
              bookId: book.id,
            },
          ),
        ),
        transaction,
      );

      return book;
    });
  }
}
