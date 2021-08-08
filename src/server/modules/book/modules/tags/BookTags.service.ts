import {Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {groupRawMany} from '@server/common/helpers/db';

import {TagEntity} from '../../../tag/Tag.entity';
import {BookGroupedSelectAttrs} from '../../shared/types';

@Injectable()
export class BookTagsService {
  /**
   * Returns array of tags for books
   *
   * @param {BookGroupedSelectAttrs} attrs
   * @returns {Promise<Record<string, TagEntity[]>>}
   * @memberof BookService
   */
  async findBooksTags(
    {
      booksIds,
      select = [
        't.id as "id"',
        't.name as "name"',
        't.parameterizedName as "parameterizedName"',
      ],
    }: BookGroupedSelectAttrs,
  ): Promise<Record<string, TagEntity[]>> {
    const items = await (
      TagEntity
        .createQueryBuilder('t')
        .innerJoin(
          'book_tags_tag',
          'bt',
          'bt.bookId in (:...booksIds) and bt.tagId = t.id',
          {
            booksIds,
          },
        )
        .select(
          [
            'bt.bookId as "bookId"',
            ...select,
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (item) => new TagEntity(item),
      },
    );
  }

  /**
   * Returns all tags for specific book
   *
   * @param {number} bookId
   * @returns
   * @memberof TagService
   */
  async findBookTags(bookId: number) {
    return (await this.findBooksTags(
      {
        booksIds: [bookId],
      },
    ))[bookId] || [];
  }

  /**
   * Performs insert tags for specific books
   *
   * @param {Record<number, number[]>} book to tags map
   * @param {EntityManager} entityManager
   * @returns
   */
  async appendTagsForBooks(
    tags: Record<string, number[]>,
    entityManager: EntityManager = <any> TagEntity,
  ) {
    await pMap(
      R.toPairs(tags),
      async ([bookId, tagsIds]) => {
        await (
          entityManager
            .createQueryBuilder()
            .insert()
            .into('book_tags_tag')
            .values(
              tagsIds.map((tagId) => ({
                bookId,
                tagId,
              })),
            )
            .execute()
        );
      },
      {
        concurrency: 2,
      },
    );
  }
}
