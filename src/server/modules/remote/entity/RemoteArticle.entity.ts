import {
  Column, Entity, Index,
  JoinTable, ManyToMany, Unique,
} from 'typeorm';

import {RemoteRecordFields} from '@server/modules/remote/entity';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity/ImageAttachment.entity';

@Entity(
  {
    name: 'scrapper_article',
  },
)
@Unique(
  'scrapper_article_unique_remote_website',
  ['website', 'remoteId'],
)
@Index(['website'])
export class RemoteArticleEntity extends RemoteRecordFields {
  static readonly coverTableName = 'scrapper_article_cover_attachments';

  @Column('timestamp', {nullable: true})
  publishDate: Date;

  @Column('text', {nullable: true})
  title: string;

  @Column('text', {nullable: true})
  description: string;

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: RemoteArticleEntity.coverTableName,
    },
  )
  cover: ImageAttachmentEntity[];
}
