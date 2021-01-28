import * as R from 'ramda';
import {Transform} from 'class-transformer';
import {
  Entity, Column,
  ManyToMany, OneToMany, JoinTable, JoinColumn, ManyToOne, RelationId,
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
import {BookSeriesEntity} from './modules/series/BookSeries.entity';
import {BookPrizeEntity} from './modules/prize/BookPrize.entity';

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
  @ManyToMany(
    () => BookCategoryEntity,
    (categoryEntity) => categoryEntity.books,
    {
      cascade: ['insert', 'update'],
    },
  )
  categories: BookCategoryEntity[];

  @OneToMany(() => BookReviewEntity, (review) => review.book)
  reviews: BookReviewEntity[];

  @JoinTable()
  @ManyToMany(() => BookReviewerEntity, (reviewer) => reviewer.books)
  reviewers: BookReviewerEntity[];

  @Transform(R.map(R.prop('name')) as any)
  @JoinTable()
  @ManyToMany(
    () => TagEntity,
    {
      cascade: ['insert', 'update'],
    },
  )
  tags: TagEntity[];

  @OneToMany(() => BookReleaseEntity, (entity) => entity.book, {cascade: true})
  releases: BookReleaseEntity[];

  @OneToMany(() => BookAvailabilityEntity, (entity) => entity.book)
  availability: BookAvailabilityEntity[];

  @ManyToOne(() => BookVolumeEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'volumeId'})
  volume: BookVolumeEntity;

  @Column({nullable: true})
  @RelationId((entity: BookEntity) => entity.volume)
  volumeId: number;

  @JoinTable()
  @ManyToMany(() => BookSeriesEntity)
  series: BookSeriesEntity[];

  @JoinTable()
  @ManyToMany(() => BookPrizeEntity, {cascade: ['insert']})
  prizes: BookPrizeEntity[];

  constructor(partial: Partial<BookEntity>) {
    super();
    Object.assign(this, partial);
  }
}
