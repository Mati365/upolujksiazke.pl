import {
  Collection, Entity, ManyToMany,
  OneToMany,
  Property, Unique,
} from '@mikro-orm/core';

import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {AuthorEntity} from '../author/Author.entity';
import {BookReviewEntity} from '../book-review/BookReview.entity';

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

  @OneToMany(() => BookReviewEntity, (b) => b.book)
  reviews: Collection<BookReviewEntity> = new Collection<BookReviewEntity>(this);
}
