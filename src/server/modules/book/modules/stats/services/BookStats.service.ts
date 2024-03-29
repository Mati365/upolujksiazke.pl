import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {objPropsToPromise, removeNullValues} from '@shared/helpers';

import {TrackerRecordType, TrackerViewsMode} from '@shared/enums';
import {TrackRecordViewsService} from '@server/modules/tracker/service/TrackRecordViews.service';
import {EsBookIndex} from '../../search/indices/EsBook.index';
import {CardBookSearchService} from '../../search/service/CardBookSearch.service';
import {BookEntity} from '../../../entity/Book.entity';
import {BookParentCategoryService} from '../../category/services/BookParentCategory.service';

type BookStats = Pick<
/* eslint-disable @typescript-eslint/indent */
  BookEntity,
  'avgRating' | 'totalRatings' | 'lowestPrice' | 'highestPrice'
  | 'allTypes' | 'totalTextReviews' | 'primaryCategoryId'
/* eslint-enable @typescript-eslint/indent */
>;

@Injectable()
export class BookStatsService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly trackViewsService: TrackRecordViewsService,
    private readonly bookParentCategoryService: BookParentCategoryService,

    @Inject(forwardRef(() => CardBookSearchService))
    private readonly bookSearchService: CardBookSearchService,

    @Inject(forwardRef(() => EsBookIndex))
    private readonly bookEsIndex: EsBookIndex,
  ) {}

  /**
   * Returns total number of books
   *
   * @todo
   *  Add caching?
   *
   * @returns
   * @memberof BookStatsService
   */
  getTotalBooks() {
    return BookEntity.count();
  }

  /**
   * Computes score for book and returns value
   *
   * @param {number} id
   * @param {BookStats} stats
   * @memberof BookStatsService
   * @returns {Promise<number>}
   */
  async calcBookRankingScore(id: number, stats: BookStats): Promise<number> {
    const {trackViewsService} = this;
    const totalViews = await trackViewsService.getSummaryPeriodViewsCount(
      {
        duration: TrackRecordViewsService.getCurrentMonthDuration(),
        mode: TrackerViewsMode.DAY,
        type: TrackerRecordType.BOOK,
        recordId: id,
      },
    );

    let score = totalViews * 8 + stats.totalTextReviews * 4 + stats.totalRatings / 400;
    if (stats.avgRating < 7)
      score *= 0.75;

    return Math.ceil(score);
  }

  /**
   * Finds book in database and refreshes its ratings
   *
   * @param {number} id
   * @param {boolean} reindex
   * @memberof BookStatsService
   */
  async refreshBookStats(id: number, reindex: boolean = true) {
    const {
      entityManager,
      bookEsIndex,
      bookParentCategoryService,
    } = this;

    const defaultCategoryId = await bookParentCategoryService.findDefaultParentCategory().then(R.prop('id'));
    const [stats]: [BookStats] = await entityManager.query(
      /* sql */ `
        with
          releases as (
            select br."id", br."bookId", br."type"
            from book_release br
            where "bookId" = $1
          ),
          release_types as (
            select array (select br."type" from releases br group by "type") as items
          ),
          availability as (
            select
              min("price")::float as "lowestPrice",
              max("price")::float as "highestPrice",
              sum("avgRating" * coalesce("totalRatings", 0))::float as "sumRatings",
              sum(CASE WHEN "avgRating" IS NULL THEN 0 ELSE "totalRatings" END)::int as "totalRatings"
            from book_availability ba
            left join releases r on r."id" = ba."releaseId"
            where r."bookId" = $1
          ),
          reviews as (
            select
              sum(
                case when br."description" is not null and bv."hidden" <> true then 1 else 0 end
              ) as "totalTextReviews",
              sum(case when br."includeInStats" = true then "rating" else 0 end)::float as "sumRatings",
              count(
                case when "rating" is null and br."includeInStats" = true then null else 1 end
              )::int as "totalRatings"
            from book_review br
            left join book_reviewer bv on bv."id" = br."reviewerId"
            where br."bookId" = $1
          ),
          primary_category as (
            select coalesce(b."primaryCategoryId", bc."parentCategoryId") as "id"
            from book_category bc
            inner join book_categories_book_category bcbc on bcbc."bookCategoryId" = bc."id"
            inner join book b on b."id" = bcbc."bookId"
            where bcbc."bookId" = $1 and bc."root" != true and bc."parentCategoryId" <> $2
            group by coalesce(b."primaryCategoryId", bc."parentCategoryId")
            order by count(bc."parentCategoryId") desc
            limit 1
          )
        select
          a."lowestPrice",
          a."highestPrice",
          (coalesce(a."sumRatings", 0) + coalesce(r."sumRatings", 0))
            / nullif(a."totalRatings" + r."totalRatings", 0) as "avgRating",
          (coalesce(a."totalRatings", 0) + coalesce(r."totalRatings", 0)) as "totalRatings",
          rt."items" as "allTypes",
          r."totalTextReviews",
          (select "id" from primary_category) as "primaryCategoryId"
        from availability a
        cross join reviews r
        cross join release_types rt
      `,
      [id, defaultCategoryId],
    );

    const {rankingScore, primaryCategoryId} = await objPropsToPromise(
      {
        rankingScore: this.calcBookRankingScore(id, stats),
        primaryCategoryId: stats.primaryCategoryId ?? defaultCategoryId,
      },
    );

    await BookEntity.update(
      id,
      removeNullValues(
        {
          ...stats,
          rankingScore,
          primaryCategoryId,
        },
      ),
    );

    if (reindex)
      await bookEsIndex.reindexEntity(id);
  }

  /**
   * Refresh stats for provided list of books
   *
   * @param {number[]} ids
   * @memberof BookStatsService
   */
  async refreshBooksStats(ids: number[]) {
    await pMap(
      ids,
      (id) => this.refreshBookStats(id, false),
      {
        concurrency: 3,
      },
    );

    await this.bookEsIndex.reindexBulk(ids);
  }

  /**
   * Iterates over all books and updates stats
   *
   * @memberof BookStatsService
   */
  async refreshAllBooksStats() {
    const {bookEsIndex} = this;
    const it = this.bookSearchService.createIdsIteratedQuery(
      {
        pageLimit: 40,
      },
    );

    for await (const [, ids] of it)
      await this.refreshBooksStats(ids);

    await bookEsIndex.reindexAllEntities();
  }
}
