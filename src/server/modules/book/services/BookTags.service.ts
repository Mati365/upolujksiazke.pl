import {Injectable} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {TagEntity} from '../../tag/Tag.entity';

@Injectable()
export class BookTagsService {
  /**
   * Returns all tags for specific book
   *
   * @param {number} bookId
   * @returns
   * @memberof TagService
   */
  findBookTags(bookId: number) {
    return (
      TagEntity
        .createQueryBuilder('t')
        .innerJoin(
          'book_tags_tag',
          'bt', 'bt.bookId = :bookId and bt.tagId = t.id',
          {
            bookId,
          },
        )
        .select(['t.id', 't.name', 't.parameterizedName'])
        .getMany()
    );
  }

  /**
   * Returns array of tags for books
   *
   * @param {number[]} ids
   * @param {string[]} [select=['t."id"', 't."name"', 'btt."bookId"']]
   * @returns {Promise<Record<string, TagEntity[]>>}
   * @memberof BookService
   */
  async findBooksTags(
    ids: number[],
    select: string[] = ['t."id"', 't."name"', 'btt."bookId"'],
  ): Promise<Record<string, TagEntity[]>> {
    const tags = await (
      TagEntity
        .createQueryBuilder('t')
        .select(select)
        .innerJoin(
          'book_tags_tag', 'btt',
          'btt."tagId" = t."id" and btt."bookId" IN (:...booksIds)',
          {
            booksIds: ids,
          },
        )
        .getRawMany()
    );

    return tags.reduce(
      (acc, {id, name, bookId}) => {
        (acc[bookId] ||= []).push(
          new TagEntity(
            {
              id,
              name,
            },
          ),
        );

        return acc;
      },
      [],
    );
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
