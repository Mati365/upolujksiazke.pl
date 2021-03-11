import {Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import * as R from 'ramda';

import {BookEntity} from '../Book.entity';

type BookStats = Pick<BookEntity, 'avgRating'|'totalRatings'|'lowestPrice'|'highestPrice'>;

@Injectable()
export class BookStatsService {
  constructor(
    private readonly entityManager: EntityManager,
  ) {}

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
    };

    releases.forEach(({reviews, availability}) => {
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
   * @memberof BookStatsService
   */
  async refreshStats(id: number) {
    const {entityManager} = this;
    const [stats]: [BookStats] = await entityManager.query(/* sql */ `
      with
        availability as (
          select
            min("price")::float as "lowestPrice",
            max("price")::float as "highestPrice",
            sum("avgRating")::float as "sumRatings",
            sum(CASE WHEN "avgRating" IS NULL THEN 0 ELSE "totalRatings" END)::int as "totalRatings",
            sum(CASE WHEN "avgRating" IS NULL THEN 0 ELSE 1 END)::int as "totalAvgItems"
          from public.book_availability
          where "bookId" = $1
        ),
        reviews as (
          select
            sum("rating")::float as "sumRatings",
            count(CASE WHEN "rating" IS NULL THEN 0 ELSE 1 END)::int as "totalAvgItems"
          from public.book_review
          where "bookId" = $1 and "includeInStats" = true
        )
      select
        a."lowestPrice",
        a."highestPrice",
        (coalesce(a."sumRatings", 0) + coalesce(r."sumRatings", 0))
          / nullif(a."totalAvgItems" + r."totalAvgItems", 0) as "avgRating",
        (coalesce(a."totalRatings", 0) + coalesce(r."totalAvgItems", 0)) as "totalRatings"
      from availability a
      cross join reviews r
    `, [id]);

    await BookEntity.save(
      new BookEntity(
        {
          id,
          ...stats,
        },
      ),
    );
  }
}
