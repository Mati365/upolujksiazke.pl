import * as R from 'ramda';
import {
  BeforeInsert, BeforeUpdate, Column,
  Entity, Index, JoinColumn, JoinTable, ManyToMany,
  ManyToOne, OneToMany, RelationId,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {normalizeHTML} from '@server/modules/importer/kinds/scrappers/helpers';

import {
  BookProtection,
  BookBindingKind,
  BookType,
} from '@shared/enums/bookTypes';

import {Language} from '@shared/enums/language';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity/ImageAttachment.entity';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../entity/Book.entity';
import {BookPublisherEntity} from '../publisher/BookPublisher.entity';
import {BookReviewEntity} from '../review/entity/BookReview.entity';
import {BookAvailabilityEntity} from '../availability/BookAvailability.entity';

export {
  BookProtection,
  BookBindingKind,
  BookType,
};

@Entity(
  {
    name: 'book_release',
  },
)
@Index(['book'])
export class BookReleaseEntity extends DatedRecordEntity {
  static readonly coverTableName = 'book_release_cover_image_attachments';

  @Column('citext', {nullable: true})
  title: string;

  @Column('text', {nullable: true})
  parameterizedSlug: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('text', {nullable: true})
  publishDate: string; // due to fuzzy dates

  @Column('text', {nullable: true})
  place: string;

  @Column('citext', {unique: true})
  isbn: string;

  @Column('text', {nullable: true})
  format: string;

  @Column('citext', {nullable: true})
  edition: string;

  @Column('text', {nullable: true, array: true})
  translator: string[];

  @Column('int', {nullable: true})
  totalPages: number;

  @Column('float', {nullable: true})
  weight: number;

  @Column('int', {nullable: true})
  recordingLength: number;

  @Column(
    'decimal',
    {
      precision: 5,
      scale: 2,
      nullable: true,
    },
  )
  defaultPrice: number;

  @ManyToOne(() => BookReleaseEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'parentReleaseId'})
  parentRelease: BookReleaseEntity;

  @Column({nullable: true})
  @RelationId((entity: BookReleaseEntity) => entity.parentRelease)
  parentReleaseId: number;

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: BookReleaseEntity.coverTableName,
    },
  )
  cover: ImageAttachmentEntity[];

  @Column(
    {
      type: 'enum',
      enum: BookType,
      nullable: true,
    },
  )
  type: BookType;

  @Column(
    {
      type: 'enum',
      enum: BookProtection,
      nullable: true,
    },
  )
  protection: BookProtection;

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

  @Column({nullable: true})
  @RelationId((entity: BookReleaseEntity) => entity.publisher)
  publisherId: number;

  @ManyToOne(() => BookEntity, (entity) => entity.releases, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'bookId'})
  book: BookEntity;

  @Column()
  @RelationId((entity: BookReleaseEntity) => entity.book)
  bookId: number;

  @OneToMany(() => BookReviewEntity, (review) => review.release)
  reviews: BookReviewEntity[];

  @OneToMany(() => BookAvailabilityEntity, (entity) => entity.release)
  availability: BookAvailabilityEntity[];

  constructor(partial: Partial<BookReleaseEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {isbn, title, description, translator, type} = this;

    if (isbn)
      this.isbn = isbn.replaceAll('-', '');

    if (title) {
      this.title = title.trim();
      this.parameterizedSlug = parameterize(this.title);
    }

    if (description)
      this.description = normalizeHTML(description.trim());

    if (R.isEmpty(translator))
      this.translator = null;

    if (type === BookType.AUDIOBOOK) {
      this.totalPages = null;
      this.binding = null;
    }
  }
}
