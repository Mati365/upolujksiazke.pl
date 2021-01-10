import * as R from 'ramda';
import {Transform} from 'class-transformer';
import {
  Entity, Column,
  ManyToMany, OneToMany, JoinTable,
} from 'typeorm';

import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {TagEntity} from '../tag/Tag.entity';
import {BookAuthorEntity} from './modules/author/BookAuthor.entity';
import {BookCategoryEntity} from './modules/category/BookCategory.entity';
import {BookReviewEntity} from './modules/review/BookReview.entity';
import {BookReviewerEntity} from './modules/reviewer/BookReviewer.entity';
import {BookReleaseEntity} from './modules/release/BookRelease.entity';

@Entity(
  {
    name: 'book',
  },
)
export class BookEntity extends DatedRecordEntity {
  @Column('text', {unique: true, nullable: true})
  originalTitle: string;

  @Column('text', {nullable: true})
  originalPublishDate: string;

  @JoinTable()
  @ManyToMany(() => BookAuthorEntity, (author) => author.books)
  authors: BookAuthorEntity[];

  @JoinTable()
  @ManyToMany(() => BookCategoryEntity, (categoryEntity) => categoryEntity.books, {cascade: true})
  categories: BookCategoryEntity[];

  @OneToMany(() => BookReviewEntity, (review) => review.book)
  reviews: BookReviewEntity[];

  @JoinTable()
  @ManyToMany(() => BookReviewerEntity, (reviewer) => reviewer.books)
  reviewers: BookReviewerEntity[];

  @Transform(R.map(R.prop('name')))
  @JoinTable()
  @ManyToMany(() => TagEntity, {cascade: true})
  tags: TagEntity[];

  @OneToMany(() => BookReleaseEntity, (entity) => entity.book)
  releases: BookReleaseEntity[];

  constructor(partial: Partial<BookEntity>) {
    super();
    Object.assign(this, partial);
  }
}
