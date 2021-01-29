import {
  Entity, Column, ManyToMany,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_author',
  },
)
export class BookAuthorEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
  name: string;

  @Column('text', {nullable: true})
  description: string;

  @ManyToMany(() => BookEntity, (book) => book.authors)
  books: BookEntity[];

  constructor(partial: Partial<BookAuthorEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {parameterizedName, name} = this;
    if (!parameterizedName && name) {
      this.parameterizedName = parameterize(name);
    }
  }
}
