import {Injectable, Inject, forwardRef} from '@nestjs/common';
import {Connection, EntityManager, In} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {
  forwardTransaction,
  runTransactionWithPostHooks,
  upsert,
} from '@server/common/helpers/db';

import {TagService} from '../../tag/Tag.service';
import {BookAuthorService} from '../modules/author/BookAuthor.service';
import {BookReleaseService} from '../modules/release/BookRelease.service';
import {BookCategoryService} from '../modules/category';
import {BookVolumeService} from '../modules/volume/BookVolume.service';
import {BookPrizeService} from '../modules/prize/BookPrize.service';
import {BookKindService} from '../modules/kind/BookKind.service';
import {BookEraService} from '../modules/era/BookEra.service';
import {
  BookHierarchySeriesService,
  BookSeriesService,
} from '../modules/series/services';

import {CreateBookDto} from '../dto/CreateBook.dto';
import {CreateBookReleaseDto} from '../modules/release/dto/CreateBookRelease.dto';
import {BookEntity} from '../entity/Book.entity';
import {BookVolumeEntity} from '../modules/volume/BookVolume.entity';
import {BookReviewEntity} from '../modules/review/BookReview.entity';
import {BookReleaseEntity} from '../modules/release/BookRelease.entity';
import {BookStatsService} from '../modules/stats/services/BookStats.service';
import {BookTagsTextHydratorService} from '../modules/seo/service/BookTagsTextHydrator.service';
import {BookGenreService} from '../modules/genre/BookGenre.service';
import {BookSummaryService} from '../modules/summary/BookSummary.service';
import {EsBookIndex} from './indexes/EsBook.index';
import {SchoolBookEntity} from '../entity/SchoolBook.entity';

/**
 * @see
 *  It is a bit stupid service! It only upserts data without additional work!
 *  If you want to simply load book to database - with all known fields - use it
 *  If you want to merge books, assign website by url, etc. use BookDbLoader.service
 *
 * @export
 * @class BookService
 */
@Injectable()
export class BookService {
  constructor(
    @Inject(forwardRef(() => BookReleaseService))
    private readonly releaseService: BookReleaseService,
    @Inject(forwardRef(() => BookCategoryService))
    private readonly categoryService: BookCategoryService,
    @Inject(forwardRef(() => BookStatsService))
    private readonly statsService: BookStatsService,
    private readonly connection: Connection,
    private readonly tagService: TagService,
    private readonly authorService: BookAuthorService,
    private readonly volumeService: BookVolumeService,
    private readonly seriesService: BookSeriesService,
    private readonly prizeService: BookPrizeService,
    private readonly kindService: BookKindService,
    private readonly seoTagsService: BookTagsTextHydratorService,
    private readonly hierarchyService: BookHierarchySeriesService,
    private readonly summaryService: BookSummaryService,
    private readonly eraService: BookEraService,
    private readonly genreService: BookGenreService,
    private readonly bookEsIndex: EsBookIndex,
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
      bookEsIndex,
      seriesService,
      releaseService,
      summaryService,
    } = this;

    const seriesIds = R.pluck(
      'bookSeriesId',
      await (
        connection
          .createQueryBuilder()
          .select('bs."bookSeriesId"')
          .from('book_series_book_series', 'bs')
          .where(
            'bs."bookId" in (:...ids)',
            {
              ids,
            },
          )
          .getRawMany()
      ),
    );

    const entities = await BookEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['releases', 'availability', 'summaries'],
        },
      },
    );

    const executor = async (transaction: EntityManager) => {
      await BookReviewEntity.delete(
        {
          bookId: In(ids),
        },
      );

      for await (const entity of entities) {
        await summaryService.delete(entity.summaries as any[], transaction);
        await releaseService.delete(entity.releases as any[], transaction);
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
    };

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      executor,
    );

    await bookEsIndex.deleteEntities(ids);

    if (seriesIds.length > 0)
      await seriesService.deleteOrphanedSeries(seriesIds);
  }

  /**
   * Performs only update without any other logic
   *
   * @param {BookEntity[]} entities
   * @param {EntityManager} entityManager
   * @returns
   */
  async shallowUpdate(
    entities: BookEntity[],
    entityManager: EntityManager = <any> BookEntity,
  ) {
    await pMap(
      entities,
      async (entity) => {
        await (
          entityManager
            .createQueryBuilder()
            .update(BookEntity)
            .set(entity)
            .where(
              {
                id: entity.id,
              },
            )
            .execute()
        );
      },
      {
        concurrency: 2,
      },
    );
  }

  /**
   * Creates or updates single book
   *
   * @todo
   *  Should we rewrite series / books etc or merge to existing?
   *
   * @param {CreateBookDto} dto
   * @param {Object} attrs
   * @returns {Promise<BookEntity>}
   * @memberof BookService
   */
  async upsert(dto: CreateBookDto): Promise<BookEntity> {
    const {
      connection, eraService,
      tagService, authorService,
      volumeService, releaseService,
      categoryService, seriesService,
      prizeService, kindService,
      statsService, seoTagsService,
      genreService, hierarchyService,
    } = this;

    const transactionResult = await runTransactionWithPostHooks(connection, async (transaction) => {
      const alreadyInDB = !R.isNil(dto.id);
      let tags = await tagService.upsert(dto.tags, transaction);
      const [
        kind,
        volume,
        series,
        prizes,
        era,
        genre,
        authors,
        categories,
      ] = (
        [
          dto.kind && (await kindService.upsert([dto.kind], transaction))[0],
          dto.volume && await volumeService.upsert(dto.volume, transaction),
          dto.series && await seriesService.upsert(dto.series, transaction),
          dto.prizes && await prizeService.upsert(dto.prizes, transaction),
          dto.era && await eraService.upsert(dto.era),
          dto.genre && await genreService.upsert(dto.genre),
          await authorService.upsert(dto.authors, transaction),
          await categoryService.upsert(dto.categories, transaction),
        ]
      );

      let book: BookEntity = null;
      if (alreadyInDB) {
        book = new BookEntity(
          {
            id: dto.id,
          },
        );
      } else {
        book = await upsert(
          {
            connection,
            entityManager: transaction,
            primaryKey: 'parameterizedSlug',
            Entity: BookEntity,
            data: new BookEntity(
              {
                parameterizedSlug: dto.genSlug(),
                schoolBook: dto.schoolBook && new SchoolBookEntity(dto.schoolBook),
                defaultTitle: dto.defaultTitle,
                originalTitle: dto.originalTitle,
                originalLang: dto.originalLang,
                originalPublishDate: dto.originalPublishDate,
                era,
                genre,
                ...dto.kindId ? {kindId: dto.kindId} : {kind},
                ...dto.volumeId ? {volumeId: dto.volumeId} : {volume},
              },
            ),
          },
        );
      }

      const upsertedReleases = await releaseService.upsertList(
        dto.releases.map(
          (release) => new CreateBookReleaseDto(
            {
              ...release,
              bookId: book.id,
            },
          ),
        ),
        {
          entityManager: transaction,
          upsertResources: false,
        },
      );

      // get most popular release
      const primaryRelease = R.reduce(
        (acc, item) => (
          (acc?.availability?.length || 0) < (item.availability?.length || 0)
            ? item
            : acc
        ),
        null as BookReleaseEntity,
        upsertedReleases,
      );

      const primaryReleaseId = (
        dto.primaryReleaseId
          ?? book.primaryReleaseId
          ?? primaryRelease?.id
      );

      const description = (
        dto.description
          ?? book.description
          ?? upsertedReleases.reduce(
            (a, b) => (a?.description?.length > b.description?.length ? a : b),
            null,
          )?.description
      );

      // insert seo tags
      let taggedDescription: string = null;
      if (!R.isNil(description)) {
        const result = await seoTagsService.hydrateTextWithPopularTags(
          {
            text: description,
          },
        );

        if (result) {
          taggedDescription = result.text;

          if (result.tags?.length) {
            tags = R.uniqBy(
              R.prop('id'),
              [
                ...tags,
                ...result.tags,
              ],
            );
          }
        }
      }

      const mergedBook: BookEntity = Object.assign(
        book,
        {
          id: book.id,
          releases: upsertedReleases,
          series,
          prizes,
          authors,
          tags,
          categories,
          ...!R.isNil(taggedDescription) && {
            description,
            taggedDescription,
          },
          ...!R.isNil(primaryRelease) && {
            primaryReleaseId,
          },
        },
      );

      // prevent typeorm saving, releases already contains bookId
      if (!alreadyInDB) {
        Object.assign(
          mergedBook,
          statsService.getLoadedEntityStats(mergedBook),
        );
      }

      await transaction.save(
        new BookEntity(
          R.omit(['releases'], mergedBook),
        ),
      );

      return {
        alreadyInDB,
        mergedBook,
      };
    });

    // post hooks
    if (transactionResult?.mergedBook) {
      const {mergedBook} = transactionResult;

      await hierarchyService.findAndCreateBookHierarchy(mergedBook.id);
      await statsService.refreshBookStats(mergedBook.id);
    }

    return transactionResult.mergedBook;
  }
}
