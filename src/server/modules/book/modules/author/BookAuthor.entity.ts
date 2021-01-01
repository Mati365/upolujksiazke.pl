import {Entity, Column, ManyToMany} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_author',
  },
)
export class BookAuthorEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.authors)
  books: BookEntity[];

  constructor(partial: Partial<BookAuthorEntity>) {
    super();
    Object.assign(this, partial);
  }
}
