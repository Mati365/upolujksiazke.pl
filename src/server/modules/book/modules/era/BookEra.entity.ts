import {
  Entity, Column, ManyToMany,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../entity/Book.entity';

@Entity(
  {
    name: 'book_era',
  },
)
export class BookEraEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.era)
  books: BookEntity[];

  constructor(partial: Partial<BookEraEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {name} = this;
    if (name) {
      this.name = name.trim().toLowerCase();
      this.parameterizedName ??= parameterize(name);
    }
  }
}
