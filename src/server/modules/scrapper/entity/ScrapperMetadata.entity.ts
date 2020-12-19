import {
  Entity, Enum, Index,
  JsonType, ManyToOne,
  Property, Unique,
} from '@mikro-orm/core';

import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {ScrapperWebsiteEntity} from './ScrapperWebsite.entity';

export enum ScrapperMetadataStatus {
  IMPORTED = 'imported',
  PROCESSING = 'processing',
  NEW = 'new',
}

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
export class ScrapperMetadataEntity extends DatedRecordEntity {
  @ManyToOne(() => ScrapperWebsiteEntity)
  website!: ScrapperWebsiteEntity;

  @Property(
    {
      columnType: 'integer',
    },
  )
  @Unique()
  remoteId!: number; // identifier in remote website

  @Property(
    {
      type: JsonType,
    },
  )
  content!: object;

  @Index()
  @Enum(() => ScrapperMetadataStatus)
  status: ScrapperMetadataStatus = ScrapperMetadataStatus.NEW;

  constructor(partial: Partial<ScrapperMetadataEntity>) {
    super();
    Object.assign(this, partial);
  }
}
