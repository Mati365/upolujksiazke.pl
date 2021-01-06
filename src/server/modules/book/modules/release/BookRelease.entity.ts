import {
  BeforeInsert, BeforeUpdate, Column,
  Entity, ManyToOne, Unique,
} from 'typeorm';

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
@Unique('unique_publisher_isbn', ['isbn', 'publisher'])
export class BookReleaseEntity extends DatedRecordEntity {
  @Column('text', {nullable: true})
  publishDate: string; // due to fuzzy dates

  @Column('text', {nullable: true})
  place: string;

  @Column('text')
  isbn: string;

  @Column('text', {nullable: true})
  format: string;

  @Column('text', {nullable: true})
  edition: string;

  @Column(
    {
      type: 'enum',
      enum: BookBindingKind,
      nullable: true,
    },
  )
  binding: BookBindingKind;

  @ManyToOne(() => BookPublisherEntity, (entity) => entity.releases)
  publisher: BookPublisherEntity;

  @ManyToOne(() => BookEntity, (entity) => entity.releases)
  book: BookEntity;

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {isbn} = this;
    if (isbn)
      this.isbn = isbn.replaceAll('-', '');
  }

  constructor(partial: Partial<BookReleaseEntity>) {
    super();
    Object.assign(this, partial);
  }
}
