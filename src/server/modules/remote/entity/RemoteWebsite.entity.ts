import * as R from 'ramda';
import {
  BeforeInsert, BeforeUpdate,
  Column, Entity,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';

@Entity(
  {
    name: 'scrapper_website',
  },
)
export class RemoteWebsiteEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  url: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('text', {nullable: true})
  title: string;

  @Column('text', {nullable: true})
  faviconUrl: string;

  constructor(partial: Partial<RemoteWebsiteEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {description, title, faviconUrl} = this;

    if (!R.trim(description || ''))
      this.description = null;

    if (!R.trim(title || ''))
      this.title = null;

    if (!R.trim(faviconUrl || ''))
      this.faviconUrl = null;
  }
}
