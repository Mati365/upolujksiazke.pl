import {Injectable} from '@nestjs/common';
import {Between, Equal} from 'typeorm';
import pMap from 'p-map';
import {startOfMonth, endOfMonth} from 'date-fns';

import {paginatedAsyncIterator} from '@server/common/helpers/db';

import {TrackerRecordType, TrackerViewsMode} from '@shared/enums';
import {Duration} from '@shared/types';
import {TrackRecordDto} from '../dto/TrackRecord.dto';
import {
  DailyViewsAggEntity,
  MonthlyViewsAggEntity,
  ViewsAggEntity,
} from '../entity';

type SummarizedRefreshStatsAttrs = {
  recordId: number,
  type: TrackerRecordType,
  duration: Required<Duration>,
  modes: {
    src: TrackerViewsMode,
    dest: TrackerViewsMode,
  },
};

@Injectable()
export class TrackRecordViewsService {
  static readonly ModeMappedEntities: Record<TrackerViewsMode, typeof ViewsAggEntity> = {
    [TrackerViewsMode.DAY]: DailyViewsAggEntity,
    [TrackerViewsMode.MONTH]: MonthlyViewsAggEntity,
  };

  /**
   * Creates or increments views aggregator record
   *
   * @param {TrackRecordDto} attrs
   * @memberof TrackRecordViewsService
   */
  async trackView(
    {
      type,
      recordId,
    }: TrackRecordDto,
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
        .onConflict('on constraint views_aggs_mode_type_unique_record do update set count = views_agg.count + 1')
        .execute()
    );
  }

  /**
   * Get summary views count between dates
   *
   * @param {Object} attrs
   * @returns {Promise<number>} views count
   * @memberof TrackRecordViewsService
   */
  async getSummaryPeriodViewsCount(
    {
      mode,
      type,
      duration,
      recordId,
    }: {
      mode: TrackerViewsMode,
      type: TrackerRecordType,
      duration: Required<Duration>,
      recordId: number,
    },
  ): Promise<number> {
    const result = await (
      DailyViewsAggEntity
        .createQueryBuilder()
        .select('SUM("count")::int as "count"')
        .where(
          {
            recordId: Equal(recordId),
            type: Equal(type),
            mode: Equal(mode),
            date: Between(duration.begin, duration.end),
          },
        )
        .getRawOne()
    );

    return result?.count;
  }

  /**
   * Refresh stats calculated per month
   *
   * @param {TrackerRecordType} type
   * @memberof MonthlyStatsCron
   */
  async refreshSummarizedStats(
    {
      recordId,
      modes,
      type,
      duration,
    }: SummarizedRefreshStatsAttrs,
  ) {
    const count = await this.getSummaryPeriodViewsCount(
      {
        mode: modes.src,
        type,
        duration,
        recordId,
      },
    );

    await (
      (<typeof ViewsAggEntity> TrackRecordViewsService.ModeMappedEntities[modes.dest])
        .createQueryBuilder()
        .insert()
        .values(
          new ViewsAggEntity(
            {
              date: duration.begin,
              count,
              type,
              recordId,
            },
          ),
        )
        .onConflict('on constraint views_aggs_mode_type_unique_record do update set "count" = EXCLUDED."count"')
        .execute()
    );
  }

  /**
   * Refresh all records from current month stats
   *
   * @memberof TrackRecordViewsService
   */
  async refreshCurrentMonthStats() {
    const duration = {
      begin: startOfMonth(new Date),
      end: endOfMonth(new Date),
    };

    const recordsIdsIterator = paginatedAsyncIterator(
      {
        limit: 60,
        queryExecutor: async ({limit, offset}) => (
          ViewsAggEntity
            .createQueryBuilder('c')
            .select('c."recordId", c."type"')
            .offset(offset)
            .limit(limit)
            .orderBy('c."recordId"', 'DESC')
            .groupBy('c."recordId", c."type"')
            .where(
              {
                mode: Equal(TrackerViewsMode.DAY),
                date: Between(duration.begin, duration.end),
              },
            )
            .getRawMany()
        ),
      },
    );

    for await (const [, aggs] of recordsIdsIterator) {
      await pMap(
        aggs,
        (agg) => this.refreshSummarizedStats(
          {
            recordId: agg.recordId,
            type: agg.type,
            modes: {
              src: TrackerViewsMode.DAY,
              dest: TrackerViewsMode.MONTH,
            },
            duration,
          },
        ),
        {
          concurrency: 2,
        },
      );
    }
  }
}
