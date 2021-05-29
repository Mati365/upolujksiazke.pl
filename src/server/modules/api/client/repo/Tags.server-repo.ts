import {plainToClass} from 'class-transformer';

import {ID} from '@shared/types';
import {TagRecord} from '@api/types/Tag.record';
import {MostPopularTagsFilters, TagsRepo} from '@api/repo';

import {TagSerializer} from '../../serializers';
import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {
  MeasureCallDuration,
  RedisMemoize,
} from '../../helpers';

export class TagsServerRepo extends ServerAPIClientChild implements TagsRepo {
  /**
   * Returns most popular tags assigned to books
   *
   * @param {MostPopularTagsFilters} {limit}
   * @return {Promise<TagRecord[]>}
   * @memberof TagsServerRepo
   */
  @MeasureCallDuration('findMostPopularTags')
  @RedisMemoize(
    {
      keyFn: ({limit}) => ({
        key: `popular-tags-${limit}`,
      }),
    },
  )
  async findMostPopularBooksTags({limit}: MostPopularTagsFilters): Promise<TagRecord[]> {
    const {bookTagsStatsService} = this.services;
    const tags = await bookTagsStatsService.findMostPopularTags(limit);

    return plainToClass(
      TagSerializer,
      tags,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  /**
   * Finds single tag
   *
   * @param {ID} id
   * @return {Promise<TagRecord>}
   * @memberof TagsServerRepo
   */
  @MeasureCallDuration('findTag')
  @RedisMemoize(
    {
      keyFn: (id) => ({
        key: `popular-tags-${id}`,
      }),
    },
  )
  async findOne(id: ID): Promise<TagRecord> {
    const {tagsService} = this.services;

    return plainToClass(
      TagSerializer,
      await tagsService.findOne(id),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
