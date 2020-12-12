import {Collection, Entity, ManyToMany, Property} from '@mikro-orm/core';

import {BookEntity} from '../book/Book.entity';
import {DatedRecordEntity} from '../database/DatedRecord.entity';

@Entity(
  {
    tableName: 'author',
  },
)
export class AuthorEntity extends DatedRecordEntity {
  @Property()
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.authors)
  books1 = new Collection<BookEntity>(this);
}
