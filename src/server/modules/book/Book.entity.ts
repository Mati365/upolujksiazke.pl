import {
  Entity, Column, Index,
  ManyToMany, OneToMany, JoinTable,
} from 'typeorm';

import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {AuthorEntity} from '../author/Author.entity';
import {BookReviewEntity} from '../book-review/BookReview.entity';
import {BookCategoryEntity} from '../book-category/BookCategory.entity';
import {BookReviewerEntity} from '../book-reviewer/BookReviewer.entity';

@Entity(
  {
    name: 'book',
  },
)
export class BookEntity extends DatedRecordEntity {
  @Column('text')
  title!: string;

  @Index(
    {
      unique: true,
    },
  )
  @Column('text')
  isbn!: string;

  @Column('text')
  description: string;

  @JoinTable()
  @ManyToMany(() => AuthorEntity, (author) => author.books)
  authors: AuthorEntity[];

  @JoinTable()
  @ManyToMany(() => BookCategoryEntity, (categoryEntity) => categoryEntity.books)
  categories: BookCategoryEntity[];

  @OneToMany(() => BookReviewEntity, (review) => review.book)
  reviews: BookReviewEntity[];

  @JoinTable()
  @ManyToMany(() => BookReviewerEntity, (reviewer) => reviewer.books)
  reviewers: BookReviewerEntity[];

  constructor(partial: Partial<BookEntity>) {
    super();
    Object.assign(this, partial);
  }
}
