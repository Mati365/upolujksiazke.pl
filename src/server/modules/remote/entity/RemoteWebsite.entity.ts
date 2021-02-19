import * as R from 'ramda';
import {
  BeforeInsert, BeforeUpdate,
  Column, Entity, JoinTable, ManyToMany,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity/ImageAttachment.entity';

@Entity(
  {
    name: 'scrapper_website',
  },
)
export class RemoteWebsiteEntity extends DatedRecordEntity {
  static logoTableName = 'scrapper_website_logo_attachments';

  @Column('citext', {unique: true})
  url: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('text', {nullable: true})
  title: string;

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: RemoteWebsiteEntity.logoTableName,
    },
  )
  logo: ImageAttachmentEntity[];

  constructor(partial: Partial<RemoteWebsiteEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {description, title} = this;

    if (!R.trim(description || ''))
      this.description = null;

    if (!R.trim(title || ''))
      this.title = null;
  }
}
