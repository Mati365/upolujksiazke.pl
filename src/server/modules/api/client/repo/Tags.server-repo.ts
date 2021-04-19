import {plainToClass} from 'class-transformer';

import {PredefinedSeconds} from '@shared/helpers';
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
    ({limit}) => ({
      key: `popular-tags-${limit}`,
      expire: PredefinedSeconds.ONE_DAY,
    }),
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
