import {EntityManager} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {convertHoursToSeconds} from '@shared/helpers';

import {ExpirableMemoize} from '@shared/helpers/decorators/ExpirableMemoizeMethod';
import {BookTagStatDAO} from '../dao/BookTagStat.dao';

@Injectable()
export class BookTagsStatsService {
  constructor(
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Performs search and returns most popular tags
   *
   * @warn
   *  It is cached!
   *
   * @param {number} [limit=500]
   * @returns
   * @memberof BookTagsStatsService
   */
  @ExpirableMemoize(
    {
      keyFn: (limit) => ({
        key: !limit && 'most-popular-tags',
        expire: convertHoursToSeconds(4),
      }),
    },
  )
  async findMostPopularTags(limit: number = 500) {
    const {entityManager} = this;
    const result = await (
      entityManager
        .createQueryBuilder()
        .from('book_tags_tag', 'btt')
        .select(
          [
            't."id"', 't."name"', 't."parameterizedName"',
            'count(btt."bookId")::int as "booksCount"',
          ],
        )
        .innerJoin('tag', 't', 't."id" = btt."tagId"')
        .groupBy('t."id", t."name", t."parameterizedName"')
        .orderBy('"booksCount"', 'DESC')
        .limit(limit)
        .getRawMany()
    );

    return result.map(
      ({id, name, parameterizedName, booksCount}) => new BookTagStatDAO(
        id,
        name,
        parameterizedName,
        booksCount,
      ),
    );
  }
}
