import * as R from 'ramda';
import {plainToClass} from 'class-transformer';

import {
  convertHoursToSeconds,
  uniqFlatHashByProp,
} from '@shared/helpers';

import {BookCategoryEntity} from '@server/modules/book/modules/category';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {
  RecentBooksRepo,
  BooksGroupsFilters,
} from '@api/repo';

import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {BookCategoryGroupSerializer} from '../../serializers';
import {
  MeasureCallDuration,
  RedisMemoize,
} from '../../helpers';

export class RecentBooksServerRepo extends ServerAPIClientChild implements RecentBooksRepo {
  /**
   * Return grouped books
   *
   * @param {BooksGroupsFilters} attrs
   * @returns {Promise<CategoryBooksGroup>}
   * @memberof RecentBooksServerRepo
   */
  @MeasureCallDuration('findCategoriesPopularBooks')
  @RedisMemoize(
    () => ({
      key: 'popular-categories-books',
      expire: convertHoursToSeconds(5),
    }),
  )
  async findCategoriesPopularBooks(
    {
      itemsPerGroup = 12,
      offset = 0,
      limit = 6,
    }: BooksGroupsFilters = {},
  ): Promise<CategoryBooksGroup[]> {
    const {entityManager, bookService} = this.services;

    const categoryBooks: {
      id: number,
      name: string,
      parameterizedName: string,
      items: number[],
    }[] = await entityManager.query(
      /* sql */ `
        select
          category."id", category."name", category."parameterizedName",
          books."items"
        from book_category category
        cross join lateral (
          select array (
            select book."id"
              from book_categories_book_category as book_categories
              left join book on book."id" = book_categories."bookId"
              where book_categories."bookCategoryId" = category."id"
              order by book."totalRatings" desc
              limit $1
          ) as items
        ) as books
        where category."promotion" > 0
        order by category."promotion" desc
        limit $2
        offset $3
      `,
      [
        itemsPerGroup,
        limit,
        offset,
      ],
    );

    const bookIds = R.pipe(
      R.pluck('items'),
      R.unnest,
      R.uniq,
    )(categoryBooks);

    const booksEntities = uniqFlatHashByProp(
      'id',
      await bookService.findCards(bookIds),
    );

    const groupEntities = (
      categoryBooks
        .map(
          ({id, name, parameterizedName, items}) => ({
            items: items.map((bookId) => booksEntities[bookId]),
            category: new BookCategoryEntity(
              {
                id,
                name,
                parameterizedName,
              },
            ),
          }),
        )
        .filter(({items}) => !R.isEmpty(items))
    );

    return plainToClass(
      BookCategoryGroupSerializer,
      groupEntities,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
