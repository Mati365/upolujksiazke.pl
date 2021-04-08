import {Injectable, Logger} from '@nestjs/common';
import {EntityManager, IsNull, Not} from 'typeorm';
import * as R from 'ramda';

import {BookEntity} from '@server/modules/book/entity/Book.entity';
import {BookVolumeEntity} from '../../volume/BookVolume.entity';
import {CreateBookSeriesDto} from '../dto/CreateBookSeries.dto';
import {BookSeriesService} from './BookSeries.service';

@Injectable()
export class BookHierarchySeriesService {
  public static readonly HIERARCHY_BOOK_CARD_FIELDS = [
    'book.id', 'book.defaultTitle', 'book.parameterizedSlug',
    'book.totalRatings', 'book.avgRating',
    'volume.id', 'volume.name',
  ];

  private readonly logger = new Logger(BookHierarchySeriesService.name);

  constructor(
    private readonly entityManager: EntityManager,
    private readonly bookSeriesService: BookSeriesService,
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
        .orderBy('volume.name')
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
   * @memberof BookHierarchySeriesService
   */
  async findAndCreateBookHierarchy(bookId: number) {
    const {
      logger,
      bookSeriesService,
      entityManager,
    } = this;

    const books: {
      id: number,
      title: string,
    }[] = await entityManager.query(
      /* sql */ `
        /* Select primary release and all book authors */
        with origin_book as (
          select br."parameterizedSlug", array_agg(ba."bookAuthorId") as "authors"
          from book b
          inner join book_authors_book_author ba on ba."bookId" = b.id
          inner join book_release br on br.id = b."primaryReleaseId"
          where b.id = $1
          group by br."parameterizedSlug"
          limit 1
        )
          /** Select book that has at least one similar author and similar primary release slug */
          select b."id", b."defaultTitle" as "title"
          FROM book b
          inner join book_release br on br."id" = b."primaryReleaseId"
          inner join book_authors_book_author baba on baba."bookId" = b."id"
          cross join origin_book origin
          where
            baba."bookAuthorId" = any(origin."authors")
            and levenshtein(br."parameterizedSlug", origin."parameterizedSlug") < 3
          group by b."id", b."defaultTitle";
      `,
      [
        bookId,
      ],
    );

    if (books?.length <= 1) {
      logger.warn('No series books found!');
      return;
    }

    const [series] = await bookSeriesService.upsert(
      [
        new CreateBookSeriesDto(
          {
            name: books[0].title,
            hierarchic: true,
          },
        ),
      ],
    );

    await (
      entityManager
        .createQueryBuilder()
        .update(BookEntity)
        .whereInIds(R.pluck('id', books))
        .set(
          {
            hierarchicSeriesId: series.id,
          },
        )
        .execute()
    );
  }
}
