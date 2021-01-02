import * as R from 'ramda';
import {Transform} from 'class-transformer';
import {
  Entity, Column, Index,
  ManyToMany, OneToMany,
  JoinTable, BeforeInsert,
  BeforeUpdate, OneToOne, JoinColumn,
} from 'typeorm';

import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {TagEntity} from '../tag/Tag.entity';
import {BookAuthorEntity} from './modules/author/BookAuthor.entity';
import {BookCategoryEntity} from './modules/category/BookCategory.entity';
import {BookReviewEntity} from './modules/review/BookReview.entity';
import {BookReviewerEntity} from './modules/reviewer/BookReviewer.entity';
import {RemoteRecordEntity} from '../remote/entity';

@Entity(
  {
    name: 'book',
  },
)
export class BookEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  title!: string;

  @Index(
    {
      unique: true,
    },
  )
  @Column('text')
  isbn!: string;

  @Column('text', {nullable: true})
  description: string;

  @JoinTable()
  @ManyToMany(() => BookAuthorEntity, (author) => author.books)
  authors: BookAuthorEntity[];

  @JoinTable()
  @ManyToMany(() => BookCategoryEntity, (categoryEntity) => categoryEntity.books)
  categories: BookCategoryEntity[];

  @OneToMany(() => BookReviewEntity, (review) => review.book)
  reviews: BookReviewEntity[];

  @JoinTable()
  @ManyToMany(() => BookReviewerEntity, (reviewer) => reviewer.books)
  reviewers: BookReviewerEntity[];

  @Transform(R.map(R.prop('name')))
  @JoinTable()
  @ManyToMany(() => TagEntity)
  tags: TagEntity[];

  @OneToOne(() => RemoteRecordEntity)
  @JoinColumn()
  remote: RemoteRecordEntity;

  constructor(partial: Partial<BookEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {isbn} = this;
    if (isbn)
      this.isbn = isbn.replaceAll('-', '');
  }
}
