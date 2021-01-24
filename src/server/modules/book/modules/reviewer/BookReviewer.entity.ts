import {
  Column, ManyToMany,
  OneToMany, Unique, Index,
} from 'typeorm';

import {Gender} from '@shared/types';
import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity';

import {BookEntity} from '../../Book.entity';
import {BookReviewEntity} from '../review/BookReview.entity';

@RemoteRecordEntity(
  {
    name: 'book_reviewer',
  },
)
@Unique('book_reviewer_unique_website_name', ['name', 'website'])
@Index(['website'])
export class BookReviewerEntity extends RemoteRecordFields {
  @Column('text')
  name: string;

  @Column(
    {
      type: 'enum',
      enum: Gender,
      default: Gender.UNKNOWN,
    },
  )
  gender?: Gender;

  @ManyToMany(() => BookEntity, (book) => book.reviewers)
  books: BookEntity[];

  @OneToMany(() => BookReviewEntity, (entity) => entity.reviewer)
  reviews: BookReviewEntity[];

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<BookReviewerEntity>) {
    super(partial);
  }
}
