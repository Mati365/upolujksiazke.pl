import {
  Entity, Enum, expr, Filter, FilterQuery, Index,
  JsonType, ManyToOne,
  Property, Unique,
} from '@mikro-orm/core';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {ScrapperWebsiteEntity} from './ScrapperWebsite.entity';

export enum ScrapperMetadataKind {
  BOOK_REVIEW = 1,
  BOOK = 2,
}

export enum ScrapperMetadataStatus {
  IMPORTED = 1,
  PROCESSING = 2,
  NEW = 3,
}

export const INVALID_METADATA_FILTERS: FilterQuery<any> = {
  [expr('(content->>\'content\')::text')]: {
    $eq: null,
  },
};

/**
 * Saves already scrapped records (in case of improve scrappers)
 *
 * @export
 * @class ScrapperMetadataEntity
 * @extends {DatedRecordEntity}
 */
@Entity(
  {
    tableName: 'scrapper_metadata',
  },
)
@Filter(
  {
    name: 'invalid',
    args: false,
    cond: INVALID_METADATA_FILTERS,
  },
)
@Unique(
  {
    properties: ['remoteId', 'website'],
  },
)
export class ScrapperMetadataEntity extends DatedRecordEntity {
  @ManyToOne(() => ScrapperWebsiteEntity)
  website!: ScrapperWebsiteEntity;

  @Property(
    {
      columnType: 'integer',
    },
  )
  remoteId!: number; // identifier in remote website

  @Property(
    {
      type: JsonType,
    },
  )
  content!: object;

  @Index()
  @Enum(
    {
      items: () => ScrapperMetadataKind,
      default: ScrapperMetadataKind.BOOK_REVIEW,
    },
  )
  kind: ScrapperMetadataKind = ScrapperMetadataKind.BOOK_REVIEW;

  @Index()
  @Enum(
    {
      items: () => ScrapperMetadataStatus,
      default: ScrapperMetadataStatus.NEW,
    },
  )
  status: ScrapperMetadataStatus = ScrapperMetadataStatus.NEW;

  constructor(partial: Partial<ScrapperMetadataEntity>) {
    super();
    Object.assign(this, partial);
  }
}
