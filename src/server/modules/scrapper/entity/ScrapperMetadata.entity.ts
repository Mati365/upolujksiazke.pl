import {Entity, ManyToOne, Property, Unique} from '@mikro-orm/core';

import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {ScrapperWebsiteEntity} from './ScrapperWebsite.entity';

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
      columnType: 'text',
    },
  )
  path!: string;

  @Property(
    {
      columnType: 'integer',
    },
  )
  @Unique()
  remoteId!: string; // identifier in remote website

  @Property(
    {
      columnType: 'text',
    },
  )
  html!: string;
}
