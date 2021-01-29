import {
  Column, Entity, JoinTable,
  ManyToMany, OneToMany,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';

import {ImageAttachmentEntity} from '@server/modules/attachment/entity';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';
import {BookSeriesEntity} from '../series/BookSeries.entity';

@Entity(
  {
    name: 'book_publisher',
  },
)
export class BookPublisherEntity extends DatedRecordEntity {
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

  @OneToMany(() => BookSeriesEntity, (entity) => entity.publisher)
  series: BookSeriesEntity[];

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: 'book_publisher_logo_image_attachments',
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
    const {parameterizedName, name} = this;
    if (!parameterizedName && name) {
      this.parameterizedName = parameterize(name);
    }
  }
}
