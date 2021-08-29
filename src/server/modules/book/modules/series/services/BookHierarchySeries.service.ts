import {Inject, Injectable, Logger, forwardRef} from '@nestjs/common';
import {EntityManager, IsNull, Not} from 'typeorm';
import * as R from 'ramda';

import {BookEntity} from '@server/modules/book/entity/Book.entity';
import {BookVolumeEntity} from '../../volume/BookVolume.entity';
import {EsFuzzyBookSearchService} from '../../search/service/EsFuzzyBookSearch.service';
import {CardBookSearchService} from '../../search/service/CardBookSearch.service';
import {CreateBookSeriesDto} from '../dto/CreateBookSeries.dto';
import {BookSeriesService} from './BookSeries.service';

@Injectable()
export class BookHierarchySeriesService {
  public static readonly HIERARCHY_BOOK_CARD_FIELDS = [
    'book.id', 'book.defaultTitle', 'book.parameterizedSlug',
    'book.totalRatings', 'book.avgRating',
    'volume.id', 'volume.name', 'book.originalPublishYear',
  ];

  private readonly logger = new Logger(BookHierarchySeriesService.name);

  constructor(
    private readonly entityManager: EntityManager,
    private readonly bookSeriesService: BookSeriesService,
    private readonly esFuzzyBookSearchService: EsFuzzyBookSearchService,

    @Inject(forwardRef(() => CardBookSearchService))
    private readonly cardBookSearch: CardBookSearchService,
  ) {}

  /**
   * Finds grouped by series books
   *
   * @param {number} bookId
   * @returns
   * @memberof BookHierarchySeriesService
   */
  async findBookHierarchyBooks(bookId: number) {
    const results = await (
      BookEntity
        .createQueryBuilder('b')
        .select(BookHierarchySeriesService.HIERARCHY_BOOK_CARD_FIELDS)
        .innerJoin(BookEntity, 'book', 'book."hierarchicSeriesId" = b."hierarchicSeriesId"')
        .leftJoin(BookVolumeEntity, 'volume', 'book."volumeId" = volume."id"')
        .where(
          {
            id: bookId,
            hierarchicSeriesId: Not(IsNull()),
          },
        )
        .orderBy('book."originalPublishYear"', 'ASC')
        .getRawMany()
    );

    return results.map((b) => new BookEntity(
      {
        id: b.book_id,
        defaultTitle: b.book_defaultTitle,
        parameterizedSlug: b.book_parameterizedSlug,
        totalRatings: b.book_totalRatings,
        avgRating: b.book_avgRating,
        volumeId: b.volume_id,
        volume: new BookVolumeEntity(
          {
            id: b.volume_id,
            name: b.volume_name,
          },
        ),
      },
    ));
  }

  /**
   * Finds similar named books and creates series
   *
   * @param {number} bookId
   * @param {boolean} [ignoreIfHasSeries]
   * @returns
   * @memberof BookHierarchySeriesService
   */
  async findAndCreateBookHierarchy(bookId: number, ignoreIfHasSeries?: boolean) {
    const {
      logger,
      bookSeriesService,
      entityManager,
      esFuzzyBookSearchService,
    } = this;

    // remove previous series
    const book = await BookEntity.findOne(bookId, {select: ['hierarchicSeriesId']});
    if (!R.isNil(book?.hierarchicSeriesId)) {
      if (ignoreIfHasSeries)
        return;

      await bookSeriesService.deleteOrphanedSeries([book.hierarchicSeriesId], 2);
    }

    const similarBooks = await esFuzzyBookSearchService.findSimilarAuthorSeriesBook(
      {
        bookId,
        source: ['defaultTitle'],
      },
    );

    if (!similarBooks.length) {
      logger.warn('No series books found!');
      return;
    }

    const [series] = await bookSeriesService.upsert(
      [
        new CreateBookSeriesDto(
          {
            name: similarBooks[0].defaultTitle,
            hierarchic: true,
          },
        ),
      ],
    );

    await (
      entityManager
        .createQueryBuilder()
        .update(BookEntity)
        .whereInIds(
          [
            ...R.pluck('id', similarBooks),
            bookId,
          ],
        )
        .set(
          {
            hierarchicSeriesId: series.id,
          },
        )
        .execute()
    );
  }

  /**
   * Rewrites descriptions of all books
   *
   * @param {boolean} [ignoreIfHasSeries]
   * @memberof BookHierarchySeriesService
   */
  async findSeriesForAllBooks(ignoreIfHasSeries?: boolean) {
    const {cardBookSearch} = this;
    const booksIterator = cardBookSearch.createIdsIteratedQuery(
      {
        pageLimit: 30,
      },
    );

    for await (const [, ids] of booksIterator) {
      for await (const id of ids)
        await this.findAndCreateBookHierarchy(id, ignoreIfHasSeries);
    }
  }
}
