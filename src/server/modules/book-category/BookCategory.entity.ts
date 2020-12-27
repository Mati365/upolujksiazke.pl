import {Entity, Column, ManyToMany} from 'typeorm';

import {BookEntity} from '../book/Book.entity';
import {DatedRecordEntity} from '../database/DatedRecord.entity';

@Entity(
  {
    name: 'book_category',
  },
)
export class BookCategoryEntity extends DatedRecordEntity {
  @Column('text')
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.categories)
  books: BookEntity[];

  constructor(partial: Partial<BookCategoryEntity>) {
    super();
    Object.assign(this, partial);
  }
}
