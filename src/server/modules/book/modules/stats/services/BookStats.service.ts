import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import pMap from 'p-map';

import {removeNullValues} from '@shared/helpers';

import {EsBookIndex} from '../../search/indices/EsBook.index';
import {CardBookSearchService} from '../../search/service/CardBookSearch.service';
import {BookEntity} from '../../../entity/Book.entity';

type BookStats = Pick<BookEntity, 'avgRating' | 'totalRatings' | 'lowestPrice' | 'highestPrice' | 'allTypes'>;

@Injectable()
export class BookStatsService {
  constructor(
    private readonly entityManager: EntityManager,

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
          ),
          primary_category as (
            select bc."parentCategoryId" as "id"
            from book_category bc
            inner join book_categories_book_category bcbc on bcbc."bookCategoryId" = bc."id"
            inner join book b on b.id = bcbc."bookId"
            where bcbc."bookId" = $1 and b."primaryCategoryId" is null
            group by bc."parentCategoryId"
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
          (select "id" from primary_category) as "primaryCategoryId"
        from availability a
        cross join reviews r
        cross join release_types rt
      `,
      [id],
    );

    await BookEntity.update(
      id,
      removeNullValues(stats),
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
    const it = this.bookSearchService.createIdsIteratedQuery(
      {
        pageLimit: 40,
      },
    );

    for await (const [, ids] of it)
      await this.refreshBooksStats(ids);
  }
}
