import {Entity, Column, ManyToMany} from 'typeorm';

import {BookEntity} from '../book/Book.entity';
import {DatedRecordEntity} from '../database/DatedRecord.entity';

@Entity(
  {
    name: 'author',
  },
)
export class AuthorEntity extends DatedRecordEntity {
  @Column('text')
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.authors)
  books: BookEntity[];
}
