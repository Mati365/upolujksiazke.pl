import {Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import * as R from 'ramda';

import {paginatedAsyncIterator} from '@server/common/helpers/db';
import {BookStatsService} from '../../stats/services';
import {BookCategoryEntity} from '../BookCategory.entity';

@Injectable()
export class BookCategoryRankingService {
  constructor(
    private readonly bookStats: BookStatsService,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Computes categories promotion values
   *
   * @see {@link https://stackoverflow.com/a/20224370}
   *
   * @memberof BookCategoryRankingService
   */
  async refreshCategoryRanking() {
    const {bookStats, entityManager} = this;

    const totalBooks = await bookStats.getTotalBooks();
    const categoriesIterator = paginatedAsyncIterator<{totalBooks: number, id: number}>(
      {
        limit: 50,
        queryExecutor: ({limit, offset}) => (
          BookCategoryEntity
            .createQueryBuilder('bc')
            .select(['bc.id as "id"', 'count(bcc.bookId)::int as "totalBooks"'])
            .leftJoin('book_categories_book_category', 'bcc', 'bcc.bookCategoryId = bc.id')
            .where('"promotionLock" = false')
            .groupBy('bc.id')
            .offset(offset)
            .limit(limit)
            .getRawMany()
        ),
      },
    );

    for await (const [, page] of categoriesIterator) {
      await entityManager.query(
        /* sql */ `
          update book_category
          set promotion = dataTable.newPromotion::int
          from (
            select
              unnest(string_to_array($1, ',')) as id,
              unnest(string_to_array($2, ',')) as newPromotion
          ) as dataTable
          where book_category.id = dataTable.id::int;
        `,
        [
          R
            .pluck('id', page)
            .join(','),

          page
            .map(
              (category) => (
                category.totalBooks > 0
                  ? Math.ceil((category.totalBooks / totalBooks) * 100)
                  : 0
              ),
            )
            .join(','),
        ],
      );
    }
  }
}
