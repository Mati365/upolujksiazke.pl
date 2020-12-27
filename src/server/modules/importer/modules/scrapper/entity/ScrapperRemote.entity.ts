import {Column, Unique, ManyToOne, Entity} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {ScrapperWebsiteEntity} from './ScrapperWebsite.entity';

@Entity(
  {
    name: 'scrapper_remote_record',
  },
)
@Unique('unique_remote_entry', ['remoteId', 'website'])
export class ScrapperRemoteEntity extends DatedRecordEntity {
  @Column('text')
  remoteId!: string;

  @ManyToOne(() => ScrapperWebsiteEntity)
  website!: ScrapperWebsiteEntity;

  constructor(partial: Partial<ScrapperRemoteEntity>) {
    super();
    Object.assign(this, partial);
  }
}
