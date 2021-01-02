import {Column, Entity, Index, OneToMany} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {RemoteRecordEntity} from './RemoteRecord.entity';

@Entity(
  {
    name: 'scrapper_website',
  },
)
export class RemoteWebsiteEntity extends DatedRecordEntity {
  @Column()
  @Index(
    {
      unique: true,
    },
  )
  url: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('text', {nullable: true})
  title: string;

  @Column('text', {nullable: true})
  faviconUrl: string;

  @OneToMany(() => RemoteRecordEntity, (remote) => remote.website)
  remoteRecords: RemoteRecordEntity[];

  constructor(partial: Partial<RemoteWebsiteEntity>) {
    super();
    Object.assign(this, partial);
  }
}
