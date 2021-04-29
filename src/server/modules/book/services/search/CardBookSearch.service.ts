import * as R from 'ramda';
import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {Connection, EntityTarget, SelectQueryBuilder} from 'typeorm';

import {objPropsToPromise} from '@shared/helpers';
import {paginatedAsyncIterator} from '@server/common/helpers/db/paginatedAsyncIterator';

import {Awaited} from '@shared/types';
import {BasicAPIPagination} from '@api/APIClient';
import {BooksGroupsFilters} from '@api/repo/RecentBooks.repo';

import {ImageVersion} from '@shared/enums';
import {BookReleaseService} from '../../modules/release/BookRelease.service';
import {BookCategoryEntity, BookCategoryService} from '../../modules/category';
import {BookPrizeService} from '../../modules/prize/BookPrize.service';
import {BookHierarchySeriesService} from '../../modules/series/services';

import {BookEntity} from '../../entity/Book.entity';
import {BookReviewService} from '../../modules/review/BookReview.service';
import {BookGenreService} from '../../modules/genre/BookGenre.service';
import {BookEraService} from '../../modules/era/BookEra.service';
import {BookTagsService} from '../BookTags.service';
import {BookSummaryService} from '../../modules/summary/BookSummary.service';

export type FullCardEntity = Awaited<ReturnType<CardBookSearchService['findFullCard']>>;

type BookIdsIteratorAttrs = {
  pageLimit: number,
  maxOffset?: number,
  query?: SelectQueryBuilder<BookEntity>,
};

@Injectable()
export class CardBookSearchService {
  public static readonly BOOK_CARD_FIELDS = [
    'book.createdAt', 'book.id', 'book.defaultTitle', 'book.parameterizedSlug',
    'book.totalRatings', 'book.avgRating', 'book.schoolBookId',
    'book.lowestPrice', 'book.highestPrice', 'book.allTypes',
    'primaryRelease.id',
    'author.id', 'author.name', 'author.parameterizedName',
    'cover.ratio', 'cover.nsfw', 'cover.version', 'attachment.file',
  ];

  public static readonly BOOK_FULL_CARD_FIELDS = [
    ...CardBookSearchService.BOOK_CARD_FIELDS,
    'book.originalPublishDate', 'book.taggedDescription', 'book.description',
    'schoolBook.id', 'schoolBook.classLevel', 'schoolBook.obligatory',
    'primaryRelease',
  ];

  constructor(
    @Inject(forwardRef(() => BookCategoryService))
    private readonly categoryService: BookCategoryService,
    private readonly connection: Connection,
    private readonly bookTagService: BookTagsService,
    private readonly releaseService: BookReleaseService,
    private readonly prizeService: BookPrizeService,
    private readonly reviewsService: BookReviewService,
    private readonly hierarchyService: BookHierarchySeriesService,
    private readonly genreService: BookGenreService,
    private readonly eraService: BookEraService,
    private readonly summaryService: BookSummaryService,
  ) {}

  /**
   * Creates query used to generate book cards
   *
   * @param {string[]} [selectFields=CardBookSearchService.BOOK_CARD_FIELDS]
   * @param {EntityTarget<BookEntity>} [from=BookEntity]
   * @returns
   * @memberof CardBookSearchService
   */
  createCardsQuery(
    selectFields: string[] = CardBookSearchService.BOOK_CARD_FIELDS,
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
        .leftJoin('book.authors', 'author')
        .innerJoin('book.primaryRelease', 'primaryRelease')
        .leftJoin('primaryRelease.cover', 'cover', `cover.version = '${ImageVersion.PREVIEW}'`)
        .leftJoin('cover.attachment', 'attachment')
    );
  }

  /**
   * Creates iterator that iterates over all most popular books
   * It calculates popularity by reviews count
   *
   * @param {Object} attrs
   * @memberof CardBookSearchService
   */
  createMostPopularIdsIteratedQuery(attrs: Omit<BookIdsIteratorAttrs, 'query'>) {
    return this.createIdsIteratedQuery(
      {
        ...attrs,
        query: (
          BookEntity
            .createQueryBuilder('b')
            .orderBy('b.totalRatings', 'DESC')
        ),
      },
    );
  }

  /**
   * Create query that iterates over all books
   *
   * @param {Object} attrs
   * @returns
   * @memberof CardBookSearchService
   */
  createIdsIteratedQuery(
    {
      pageLimit,
      maxOffset = Infinity,
      query = (
        BookEntity.createQueryBuilder('b')
      ),
    }: BookIdsIteratorAttrs,
  ) {
    return paginatedAsyncIterator(
      {
        maxOffset,
        limit: pageLimit,
        queryExecutor: async ({limit, offset}) => {
          const result = await (
            query
              .select('b.id')
              .offset(offset)
              .limit(limit)
              .getMany()
          );

          return R.pluck('id', result);
        },
      },
    );
  }

  /**
   * Find multiple cards, it is simple method
   *
   * @param {any[]} ids
   * @returns
   * @memberof CardBookSearchService
   */
  findBooksByIds(ids: any[]) {
    return (
      this
        .createCardsQuery()
        .whereInIds(ids)
        .getMany()
    );
  }

  /**
   * Returns grouped by category books
   *
   * @see
   *  It is slow! It makes N requests to DB due to uniq group books!
   *
   * @param {BooksGroupsFilters} groups
   * @returns
   * @memberof CardBookSearchService
   */
  async findCategoriesPopularBooks(
    {
      categoriesIds,
      excludeBooksIds = [],
      itemsPerGroup = 12,
      offset = 0,
      limit = categoriesIds?.length || 6,
    }: BooksGroupsFilters = {},
  ) {
    const {categoryService} = this;
    const popularCategories = await categoryService.findMostPopularCategories(
      {
        ids: categoriesIds,
        offset,
        limit,
      },
    );

    const groups: {
      category: BookCategoryEntity,
      items: BookEntity[],
    }[] = [];

    for await (const category of popularCategories) {
      const items = await (
        this
          .createCardsQuery()
          .where(
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            (qb) => {
              let query = (
                qb
                  .createQueryBuilder()
                  .select('bcc."bookId"')
                  .from('book_categories_book_category', 'bcc')
                  .where('bcc."bookCategoryId" = :categoryId and b."totalRatings" > 0')
                  .innerJoin('book', 'b', 'b.id = bcc."bookId"')
                  .orderBy('b.totalRatings', 'DESC')
                  .limit(itemsPerGroup)
              );

              if (excludeBooksIds.length > 0)
                query = query.andWhere('bcc."bookId" not in (:...excludeBooksIds)');

              return `book."id" IN (${query.getQuery()})`;
            },
          )
          .orderBy('book.totalRatings', 'DESC')
          .setParameters(
            {
              categoryId: category.id,
              excludeBooksIds,
            },
          )
          .getMany()
      );

      if (items?.length > 0) {
        excludeBooksIds = R.uniq(
          [
            ...excludeBooksIds,
            ...R.pluck('id', items),
          ],
        );

        groups.push(
          {
            category,
            items,
          },
        );
      }
    }

    return R.sortBy(
      ({items}) => -items.length,
      groups,
    );
  }

  /**
   * Returns newly crated books
   *
   * @param {BasicAPIPagination} attrs
   * @returns
   * @memberof CardBookSearchService
   */
  async findRecentBooks(
    {
      offset = 0,
      limit = 6,
    }: BasicAPIPagination = {},
  ) {
    return (
      this
        .createCardsQuery(
          CardBookSearchService.BOOK_CARD_FIELDS,
          (qb: SelectQueryBuilder<BookEntity>) => (
            qb
              .subQuery()
              .from(BookEntity, 'book')
              .select('*')
              .offset(offset)
              .limit(limit)
              .orderBy('book.createdAt', 'DESC')
          ),
        )
        .orderBy('book.createdAt', 'DESC')
        .getMany()
    );
  }

  /**
   * Create query with all fields for single book
   *
   * @param {Object} attrs
   * @returns
   * @memberof CardBookSearchService
   */
  async findFullCard(
    {
      id,
      reviewsCount,
      summariesCount,
    }: {
      id: number,
      reviewsCount?: number,
      summariesCount?: number,
    },
  ) {
    const {
      categoryService,
      prizeService,
      eraService,
      genreService,
      bookTagService,
      releaseService,
      reviewsService,
      hierarchyService,
      summaryService,
    } = this;

    const entity = new BookEntity;
    const {card, ...items} = await objPropsToPromise(
      {
        card: (
          this
            .createCardsQuery(CardBookSearchService.BOOK_FULL_CARD_FIELDS)
            .leftJoinAndSelect('primaryRelease.publisher', 'publisher')
            .leftJoin('book.schoolBook', 'schoolBook')
            .where(
              {
                id,
              },
            )
            .getOne()
        ),
        genre: genreService.findBookGenre(id),
        era: eraService.findBookEra(id),
        tags: bookTagService.findBookTags(id),
        categories: categoryService.findBookCategories(id),
        prizes: prizeService.findBookPrizes(id),
        summaries: summaryService.findBookSummaries(
          {
            bookId: id,
            limit: summariesCount,
          },
        ),
        releases: releaseService.findBookReleases(
          {
            bookId: id,
            coversSizes: [
              ImageVersion.THUMB,
              ImageVersion.PREVIEW,
            ],
          },
        ),
        reviews: (
          reviewsCount > 0
            ? reviewsService.findBookReviews(
              {
                bookId: id,
                limit: reviewsCount,
              },
            )
            : null
        ),
        hierarchy: hierarchyService.findBookHierarchyBooks(id),
      },
    );

    if (!card)
      return null;

    return {
      ...entity,
      ...card,
      ...items,
    };
  }
}
