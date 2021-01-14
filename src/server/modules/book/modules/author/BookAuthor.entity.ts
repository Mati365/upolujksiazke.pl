import {Entity, Column, ManyToMany} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_author',
  },
)
export class BookAuthorEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  name: string;

  @Column('text', {nullable: true})
  description: string;

  @ManyToMany(() => BookEntity, (book) => book.authors)
  books: BookEntity[];

  constructor(partial: Partial<BookAuthorEntity>) {
    super();
    Object.assign(this, partial);
  }
}
