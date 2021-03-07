import {Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import * as R from 'ramda';

import {uniqFlatHashByProp} from '@shared/helpers';

import {BookCategoryEntity} from '../modules/category/BookCategory.entity';
import {BookService} from './Book.service';

export type RecentCategoriesBooksFilters = {
  itemsPerGroup: number,
  limit: number,
  offset: number,
};

@Injectable()
export class BookGroupsService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly bookService: BookService,
  ) {}

  /**
   * @see {@link https://dba.stackexchange.com/a/213724}
   *
   * @param {RecentCategoriesBooksFilters} attrs
   * @returns
   * @memberof BookGroupsService
   */
  async findCategoriesRecentBooks(
    attrs: RecentCategoriesBooksFilters = {
      itemsPerGroup: 5,
      limit: 4,
      offset: 5,
    },
  ) {
    const {entityManager, bookService} = this;
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
              order by book."createdAt" desc
              limit $1
          ) as items
        ) as books limit $2 offset $3
      `,
      [
        attrs.itemsPerGroup,
        attrs.limit,
        attrs.offset,
      ],
    );

    const bookIds = R.pipe(
      R.pluck('items'),
      R.unnest,
      R.uniq,
    )(categoryBooks);

    const booksEntities = uniqFlatHashByProp(
      'id',
      await (
        bookService
          .createCardsQuery()
          .whereInIds(bookIds)
          .getMany()
      ),
    );

    return categoryBooks.map(
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
    );
  }
}
