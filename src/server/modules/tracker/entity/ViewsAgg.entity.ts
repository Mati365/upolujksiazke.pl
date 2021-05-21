import {
  Unique, Column,
  Entity, TableInheritance, Index,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {
  TrackerRecordType,
  TrackerViewsMode,
} from '../constants/enums';

/**
 * @export
 * @class ViewsAggEntity
 */
@Entity(
  {
    name: 'views_agg',
  },
)
@TableInheritance(
  {
    column: {
      type: 'enum',
      enum: TrackerViewsMode,
      name: 'type',
    },
  },
)
@Unique(
  'views_aggs_unique_type_record',
  ['type', 'recordId'],
)
@Index(['type', 'recordId'])
export class ViewsAggEntity extends DatedRecordEntity {
  @Column(
    {
      type: 'date',
      nullable: false,
    },
  )
  date: Date = new Date;

  @Column(
    {
      type: 'enum',
      enum: TrackerRecordType,
      nullable: false,
    },
  )
  type: TrackerRecordType;

  @Column(
    {
      type: 'integer',
      nullable: false,
    },
  )
  recordId: number;

  @Column(
    {
      type: 'integer',
      default: 0,
      nullable: false,
    },
  )
  count: number;

  constructor(partial: Partial<ViewsAggEntity>) {
    super();
    Object.assign(this, partial);
  }
}
