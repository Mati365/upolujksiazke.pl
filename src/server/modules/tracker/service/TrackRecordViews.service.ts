import {Injectable} from '@nestjs/common';
import {DailyViewsAggEntity, ViewsAggEntity} from '../entity';

type ViewTrackerAttrs = Pick<ViewsAggEntity, 'type' | 'recordId'>;

@Injectable()
export class TrackRecordViewsService {
  /**
   * Creates or increments views aggregator record
   *
   * @param {ViewTrackerAttrs} attrs
   * @memberof TrackRecordViewsService
   */
  async trackView(
    {
      type,
      recordId,
    }: ViewTrackerAttrs,
  ) {
    await (
      DailyViewsAggEntity
        .createQueryBuilder()
        .insert()
        .values(
          new DailyViewsAggEntity(
            {
              count: 1,
              type,
              recordId,
            },
          ),
        )
        .onConflict('on constraint views_aggs_dated_type_unique_record do update set count = views_agg.count + 1')
        .execute()
    );
  }
}
