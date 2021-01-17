import {
  BeforeInsert, BeforeUpdate, Column,
  Entity, Index, JoinColumn, JoinTable, ManyToMany,
  ManyToOne, OneToMany, OneToOne, RelationId, Unique,
} from 'typeorm';

import {Language} from '@server/constants/language';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity/ImageAttachment.entity';
import {RemoteRecordEntity} from '@server/modules/remote/entity/RemoteRecord.entity';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';
import {BookPublisherEntity} from '../publisher/BookPublisher.entity';
import {BookVolumeEntity} from '../volume/BookVolume.entity';
import {BookReviewEntity} from '../review/BookReview.entity';

export enum BookBindingKind {
  HARDCOVER = 1,
  PAPERBACK = 2,
  NOTEBOOK = 3,
  SPIRAL = 4,
}

@Entity(
  {
    name: 'book_release',
  },
)
@Unique('book_release_unique_publisher_edition', ['title', 'publisher', 'edition'])
@Index(['book'])
@Index(['volume'])
export class BookReleaseEntity extends DatedRecordEntity {
  @Column('citext')
  title: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('text', {nullable: true})
  publishDate: string; // due to fuzzy dates

  @Column('text', {nullable: true})
  place: string;

  @Column('text', {nullable: true})
  isbn: string;

  @Column('text', {nullable: true})
  format: string;

  @Column('citext', {nullable: true})
  edition: string;

  @Column('int', {nullable: true})
  totalPages: number;

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: 'book_release_cover_image_attachments',
    },
  )
  cover: ImageAttachmentEntity[];

  @Column(
    {
      type: 'enum',
      enum: BookBindingKind,
      nullable: true,
    },
  )
  binding: BookBindingKind;

  @Column(
    {
      type: 'enum',
      enum: Language,
      nullable: true,
    },
  )
  lang: Language;

  @ManyToOne(() => BookPublisherEntity, (entity) => entity.releases, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'publisherId'})
  publisher: BookPublisherEntity;

  @Column()
  @RelationId((entity: BookReleaseEntity) => entity.publisher)
  publisherId: number;

  @ManyToOne(() => BookEntity, (entity) => entity.releases, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'bookId'})
  book: BookEntity;

  @Column()
  @RelationId((entity: BookReleaseEntity) => entity.book)
  bookId: number;

  @OneToOne(() => RemoteRecordEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'remoteDescriptionId'})
  remoteDescription: RemoteRecordEntity;

  @Column()
  @RelationId((entity: BookReleaseEntity) => entity.remoteDescription)
  remoteDescriptionId: number;

  @ManyToOne(() => BookVolumeEntity, (entity) => entity.release, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'volumeId'})
  volume: BookVolumeEntity;

  @Column({nullable: true})
  @RelationId((entity: BookReleaseEntity) => entity.volume)
  volumeId: number;

  @OneToMany(() => BookReviewEntity, (review) => review.release)
  reviews: BookReviewEntity[];

  constructor(partial: Partial<BookReleaseEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {isbn, title, description} = this;
    if (isbn)
      this.isbn = isbn.replaceAll('-', '');

    if (title)
      this.title = title.trim();

    if (description)
      this.description = description.trim();
  }
}
