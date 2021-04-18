import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {EsBookIndex} from '@server/modules/book/services/indexes/EsBook.index';
import {CardBookSearchService} from '@server/modules/book/services/search/CardBookSearch.service';
import {BookEntity} from '../../../entity/Book.entity';

type BookStats = Pick<BookEntity, 'avgRating'|'totalRatings'|'lowestPrice'|'highestPrice'|'allTypes'>;

@Injectable()
export class BookStatsService {
  constructor(
    @Inject(forwardRef(() => CardBookSearchService))
    private readonly bookSearchService: CardBookSearchService,
    private readonly bookEsIndex: EsBookIndex,
    private readonly entityManager: EntityManager,
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
   * Calculates book stats for record that contains all
   * releases and availability records.
   * Used primarly during creating of record.
   *
   * @see
   *  It summarizes all ratings from all websites and current website ratings!
   *
   * @param {BookEntity} {releases}
   * @returns {BookStats}
   * @memberof BookStatsService
   */
  getLoadedEntityStats({releases}: BookEntity): BookStats {
    let totalAvgRatings = 0;
    const stats: BookStats = {
      avgRating: null,
      totalRatings: null,
      lowestPrice: null,
      highestPrice: null,
      allTypes: [],
    };

    releases.forEach(({reviews, availability, type}) => {
      if (!R.isNil(type) && !R.includes(type, stats.allTypes))
        stats.allTypes.push(type);

      if (availability?.length) {
        availability.forEach(
          ({avgRating, totalRatings, price}) => {
            stats.totalRatings = (stats.totalRatings || 0) + (totalRatings || 0);

            if (!R.isNil(avgRating)) {
              stats.avgRating += avgRating;
              totalAvgRatings++;
            }

            if (!R.isNil(price)) {
              stats.lowestPrice = Math.min(stats.lowestPrice ?? Infinity, price);
              stats.highestPrice = Math.max(stats.highestPrice ?? -Infinity, price);
            }
          },
        );
      }

      if (reviews?.length) {
        reviews.forEach(({rating, includeInStats}) => {
          if (!includeInStats)
            return;

          stats.avgRating += rating;
          stats.totalRatings++;
          totalAvgRatings++;
        });
      }
    });

    if (stats.avgRating !== null && totalAvgRatings > 0)
      stats.avgRating /= totalAvgRatings;

    return stats;
  }

  /**
   * Finds book in database and refreshes its ratings
   *
   * @param {number} id
   * @param {boolean} reindex
   * @memberof BookStatsService
   */
  async refreshBookStats(id: number, reindex: boolean = true) {
    const {entityManager, bookEsIndex} = this;
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
            from public.book_availability ba
            left join releases r on r."id" = ba."releaseId"
            where r."bookId" = $1
          ),
          reviews as (
            select
              sum("rating")::float as "sumRatings",
              count(CASE WHEN "rating" IS NULL THEN 0 ELSE 1 END)::int as "totalRatings"
            from public.book_review br
            where br."bookId" = $1 and br."includeInStats" = true
          )
        select
          a."lowestPrice",
          a."highestPrice",
          (coalesce(a."sumRatings", 0) + coalesce(r."sumRatings", 0))
            / nullif(a."totalRatings" + r."totalRatings", 0) as "avgRating",
          (coalesce(a."totalRatings", 0) + coalesce(r."totalRatings", 0)) as "totalRatings",
          rt."items" as "allTypes"
        from availability a
        cross join reviews r
        cross join release_types rt
      `,
      [id],
    );

    await BookEntity.update(id, stats);
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
    const it = this.bookSearchService.createIdsIteratedQuery(
      {
        pageLimit: 40,
      },
    );

    for await (const [, ids] of it)
      await this.refreshBooksStats(ids);
  }
}
