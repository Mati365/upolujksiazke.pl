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
import {BookVolumeEntity} from './modules/volume/BookVolume.entity';
import {BookAvailabilityEntity} from './modules/availability/BookAvailability.entity';

@Entity(
  {
    name: 'book',
  },
)
export class BookEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  defaultTitle: string;

  @Column('citext', {unique: true, nullable: true})
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

  @Transform(R.map(R.prop('name')) as any)
  @JoinTable()
  @ManyToMany(() => TagEntity, {cascade: true})
  tags: TagEntity[];

  @OneToMany(() => BookReleaseEntity, (entity) => entity.book, {cascade: true})
  releases: BookReleaseEntity[];

  @OneToMany(() => BookVolumeEntity, (entity) => entity.book, {cascade: true})
  volumes: BookReleaseEntity[];

  @OneToMany(() => BookAvailabilityEntity, (entity) => entity.book)
  availability: BookAvailabilityEntity[];

  constructor(partial: Partial<BookEntity>) {
    super();
    Object.assign(this, partial);
  }
}
