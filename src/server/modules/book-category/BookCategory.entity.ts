import {Collection, Entity, ManyToMany, Property} from '@mikro-orm/core';

import {BookEntity} from '../book/Book.entity';
import {DatedRecordEntity} from '../database/DatedRecord.entity';

@Entity(
  {
    tableName: 'book_category',
  },
)
export class BookCategoryEntity extends DatedRecordEntity {
  @Property()
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.categories)
  books = new Collection<BookEntity>(this);
}
