import {
  Column, Unique, ManyToOne,
  Entity, JoinColumn, RelationId,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {RemoteWebsiteEntity} from './RemoteWebsite.entity';

@Entity(
  {
    name: 'scrapper_remote_record',
  },
)
@Unique('unique_remote_entry', ['remoteId', 'website'])
export class RemoteRecordEntity extends DatedRecordEntity {
  @Column('text', {nullable: true})
  url: string;

  @Column('text')
  remoteId: string;

  @ManyToOne(() => RemoteWebsiteEntity)
  @JoinColumn({name: 'websiteId'})
  website: RemoteWebsiteEntity;

  @Column()
  @RelationId((entity: RemoteRecordEntity) => entity.website)
  websiteId: number;

  constructor(partial: Partial<RemoteRecordEntity>) {
    super();
    Object.assign(this, partial);
  }
}
