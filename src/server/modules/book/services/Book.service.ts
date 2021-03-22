import {Injectable} from '@nestjs/common';
import {Connection, EntityManager, EntityTarget, In} from 'typeorm';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';
import {
  forwardTransaction,
  runTransactionWithPostHooks,
  upsert,
} from '@server/common/helpers/db';

import {ImageVersion} from '@shared/enums';

import {TagService} from '../../tag/Tag.service';
import {BookAuthorService} from '../modules/author/BookAuthor.service';
import {BookReleaseService} from '../modules/release/BookRelease.service';
import {BookCategoryService} from '../modules/category';
import {BookVolumeService} from '../modules/volume/BookVolume.service';
import {BookSeriesService} from '../modules/series/BookSeries.service';
import {BookPrizeService} from '../modules/prize/BookPrize.service';
import {BookKindService} from '../modules/kind/BookKind.service';

import {CreateBookDto} from '../dto/CreateBook.dto';
import {CreateBookReleaseDto} from '../modules/release/dto/CreateBookRelease.dto';
import {BookEntity} from '../Book.entity';
import {BookVolumeEntity} from '../modules/volume/BookVolume.entity';
import {BookReviewEntity} from '../modules/review/BookReview.entity';
import {BookReleaseEntity} from '../modules/release/BookRelease.entity';
import {BookStatsService} from './BookStats.service';

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
  public static readonly BOOK_CARD_FIELDS = [
    'book.createdAt', 'book.id', 'book.defaultTitle', 'book.parameterizedSlug',
    'book.totalRatings', 'book.avgRating',
    'book.lowestPrice', 'book.highestPrice', 'book.allTypes',
    'primaryRelease.id',
    'author.id', 'author.name', 'author.parameterizedName',
    'cover.ratio', 'cover.nsfw', 'cover.version', 'attachment.file',
  ];

  public static readonly BOOK_FULL_CARD_FIELDS = [
    ...BookService.BOOK_CARD_FIELDS,
    'book.originalPublishDate',
    'primaryRelease',
  ];

  constructor(
    private readonly connection: Connection,
    private readonly tagService: TagService,
    private readonly authorService: BookAuthorService,
    private readonly releaseService: BookReleaseService,
    private readonly categoryService: BookCategoryService,
    private readonly volumeService: BookVolumeService,
    private readonly seriesService: BookSeriesService,
    private readonly prizeService: BookPrizeService,
    private readonly kindService: BookKindService,
    private readonly bookStatsService: BookStatsService,
  ) {}

  /**
   * Creates query used to generate book cards
   *
   * @param {string[]} [selectFields=BookService.BOOK_CARD_FIELDS]
   * @param {EntityTarget<BookEntity>} [from=BookEntity]
   * @returns
   * @memberof BookService
   */
  createCardsQuery(
    selectFields: string[] = BookService.BOOK_CARD_FIELDS,
    from: EntityTarget<BookEntity> = BookEntity,
  ) {
    const query = (
      this
        .connection
        .createQueryBuilder()
        .from(from, 'book')
    );

    query.expressionMap.mainAlias.metadata = query.connection.getMetadata(BookEntity);

    return (
      query
        .select(selectFields)
        .innerJoinAndSelect('book.volume', 'volume')
        .innerJoin('book.authors', 'author')
        .innerJoin('book.primaryRelease', 'primaryRelease')
        .innerJoin('primaryRelease.cover', 'cover', `cover.version = '${ImageVersion.PREVIEW}'`)
        .innerJoin('cover.attachment', 'attachment')
    );
  }

  /**
   * Find multiple cards
   *
   * @param {number[]} ids
   * @returns
   * @memberof BookService
   */
  findCards(ids: number[]) {
    return (
      this
        .createCardsQuery()
        .whereInIds(ids)
        .getMany()
    );
  }

  /**
   * Create query with all fields for single book
   *
   * @param {number} id
   * @returns
   * @memberof BookService
   */
  async findFullCard(id: number) {
    const {
      categoryService,
      prizeService,
      tagService,
      releaseService,
    } = this;

    const entity = new BookEntity;
    const {card, tags, categories, prizes, releases} = await objPropsToPromise(
      {
        card: (
          this
            .createCardsQuery(BookService.BOOK_FULL_CARD_FIELDS)
            .innerJoinAndSelect('primaryRelease.publisher', 'publisher')
            .where(
              {
                id,
              },
            )
            .getOne()
        ),

        tags: tagService.findBookTags(id),
        categories: categoryService.findBookCategories(id),
        prizes: prizeService.findBookPrizes(id),
        releases: releaseService.findBookReleases(
          {
            bookId: id,
            selection: [
              'r.id', 'r.publishDate', 'r.recordingLength',
              'r.lang', 'r.isbn', 'r.binding', 'r.format', 'r.type',
            ],
          },
        ),
      },
    );

    if (!card)
      return null;

    Object.assign(
      entity,
      card,
      {
        tags,
        categories,
        prizes,
        releases,
      },
    );

    return entity;
  }

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

    const executor = async (transaction: EntityManager) => {
      await BookReviewEntity.delete(
        {
          bookId: In(ids),
        },
      );

      for await (const entity of entities)
        await releaseService.delete(entity.releases as any[], transaction);

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
  }

  /**
   * Creates or updates single book
   *
   * @todo
   *  Should we rewrite series / books etc or merge to existing?
   *
   * @param {CreateBookDto} dto
   * @returns {Promise<BookEntity>}
   * @memberof BookService
   */
  async upsert(dto: CreateBookDto): Promise<BookEntity> {
    const {connection} = this;

    return runTransactionWithPostHooks(connection, async (transaction) => {
      const {
        tagService, authorService,
        volumeService, releaseService,
        categoryService, seriesService,
        prizeService, kindService,
        bookStatsService,
      } = this;

      const alreadyInDB = !R.isNil(dto.id);
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
          dto.kind && (await kindService.upsert([dto.kind], transaction))[0],
          dto.volume && await volumeService.upsert(dto.volume, transaction),
          dto.series && await seriesService.upsert(dto.series, transaction),
          dto.prizes && await prizeService.upsert(dto.prizes, transaction),
          await authorService.upsert(dto.authors, transaction),
          await tagService.upsert(dto.tags, transaction),
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
                defaultTitle: dto.defaultTitle,
                originalTitle: dto.originalTitle,
                originalLang: dto.originalLang,
                originalPublishDate: dto.originalPublishDate,
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
      const primaryReleaseId = dto.primaryReleaseId ?? book.primaryReleaseId ?? (
        R.reduce(
          (acc, item) => (
            (acc?.availability?.length || 0) < (item.availability?.length || 0)
              ? item
              : acc
          ),
          null as BookReleaseEntity,
          upsertedReleases,
        )?.id
      );

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
          ...!R.isNil(primaryReleaseId) && {
            primaryReleaseId,
          },
        },
      );

      // prevent typeorm saving, releases already contains bookId
      if (!alreadyInDB) {
        Object.assign(
          mergedBook,
          bookStatsService.getLoadedEntityStats(mergedBook),
        );
      }

      await transaction.save(
        new BookEntity(
          R.omit(['releases'], mergedBook),
        ),
      );

      if (alreadyInDB)
        await bookStatsService.refreshBookStats(book.id);

      return mergedBook;
    });
  }
}
