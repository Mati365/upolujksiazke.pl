import {Collection, Entity, OneToMany, Property, Unique} from '@mikro-orm/core';
import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {ScrapperMetadataEntity} from './ScrapperMetadata.entity';

@Entity(
  {
    tableName: 'scrapper_website',
  },
)
export class ScrapperWebsiteEntity extends DatedRecordEntity {
  @Property()
  @Unique()
  url!: string;

  @Property()
  description: string;

  @Property()
  title!: string;

  @Property()
  faviconUrl: string;

  @OneToMany(() => ScrapperMetadataEntity, (m) => m.website)
  metadata: Collection<ScrapperMetadataEntity> = new Collection<ScrapperMetadataEntity>(this);

  constructor(partial: Partial<ScrapperWebsiteEntity>) {
    super();
    Object.assign(this, partial);
  }
}
