import {
  BeforeInsert, BeforeUpdate, Column,
  Entity, JoinColumn, ManyToOne, OneToOne, RelationId, Unique,
} from 'typeorm';

import {Language} from '@server/constants/language';
import {AttachmentEntity} from '@server/modules/attachment/Attachment.entity';
import {RemoteRecordEntity} from '@server/modules/remote/entity/RemoteRecord.entity';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';
import {BookPublisherEntity} from '../publisher/BookPublisher.entity';

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
@Unique('unique_publisher_edition', ['title', 'publisher', 'edition'])
export class BookReleaseEntity extends DatedRecordEntity {
  @Column('text')
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

  @Column('text', {nullable: true})
  edition: string;

  @Column('int', {nullable: true})
  totalPages: number;

  @ManyToOne(() => AttachmentEntity, {nullable: true})
  cover: AttachmentEntity;

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
