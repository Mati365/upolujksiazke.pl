import {
  Column, Entity, JoinTable,
  ManyToMany, OneToMany,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {normalizeHTML} from '@server/modules/importer/kinds/scrappers/helpers';

import {ImageAttachmentEntity} from '@server/modules/attachment/entity';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@Entity(
  {
    name: 'book_publisher',
  },
)
export class BookPublisherEntity extends DatedRecordEntity {
  static coverTableName = 'book_publisher_logo_image_attachments';

  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
  name: string;

  @Column('text', {nullable: true})
  websiteURL: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('text', {nullable: true})
  address: string;

  @OneToMany(() => BookReleaseEntity, (entity) => entity.publisher)
  releases: BookReleaseEntity[];

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: BookPublisherEntity.coverTableName,
    },
  )
  logo: ImageAttachmentEntity[];

  constructor(partial: Partial<BookPublisherEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {name, description} = this;
    if (name)
      this.parameterizedName = parameterize(name);

    if (description)
      this.description = normalizeHTML(description.trim());
  }
}
