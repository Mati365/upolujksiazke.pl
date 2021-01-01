import {
  Entity, Column, ManyToMany,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_category',
  },
)
export class BookCategoryEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.categories)
  books: BookEntity[];

  constructor(partial: Partial<BookCategoryEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {name} = this;
    if (name)
      this.name = name.toLowerCase();
  }
}
