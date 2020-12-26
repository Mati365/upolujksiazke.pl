import {
  Collection, Entity, ManyToMany,
  OneToMany,
  Property, Unique,
} from '@mikro-orm/core';

import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {AuthorEntity} from '../author/Author.entity';
import {BookReviewEntity} from '../book-review/BookReview.entity';
import {BookCategoryEntity} from '../book-category/BookCategory.entity';
import {BookReviewerEntity} from '../book-reviewer/BookReviewer.entity';

@Entity(
  {
    tableName: 'book',
  },
)
export class BookEntity extends DatedRecordEntity {
  @Property()
  title!: string;

  @Property()
  @Unique()
  isbn!: string;

  @Property(
    {
      columnType: 'text',
    },
  )
  description: string;

  @ManyToMany(() => AuthorEntity)
  authors: Collection<AuthorEntity> = new Collection<AuthorEntity>(this);

  @ManyToMany(() => BookCategoryEntity)
  categories: Collection<BookReviewEntity> = new Collection<BookReviewEntity>(this);

  @OneToMany(() => BookReviewEntity, (b) => b.book)
  reviews: Collection<BookReviewEntity> = new Collection<BookReviewEntity>(this);

  @ManyToMany(() => BookReviewerEntity)
  reviewers: Collection<BookReviewerEntity> = new Collection<BookReviewerEntity>(this);

  constructor(partial: Partial<BookEntity>) {
    super();
    Object.assign(this, partial);
  }
}
