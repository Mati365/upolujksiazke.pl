import {
  Entity, Column, ManyToMany,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_category',
  },
)
export class BookCategoryEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
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
    if (name) {
      this.name = name.toLowerCase();
      this.parameterizedName ??= parameterize(name);
    }
  }
}
