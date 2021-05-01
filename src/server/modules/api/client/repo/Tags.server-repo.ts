import {plainToClass} from 'class-transformer';

import {TagRecord} from '@api/types/Tag.record';
import {MostPopularTagsFilters, TagsRepo} from '@api/repo';

import {TagSerializer} from '../../serializers';
import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {
  MeasureCallDuration,
  RedisMemoize,
} from '../../helpers';

export class TagsServerRepo extends ServerAPIClientChild implements TagsRepo {
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
}
