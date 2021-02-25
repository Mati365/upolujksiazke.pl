import {
  Entity, Column,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';

@Entity(
  {
    name: 'book_kind',
  },
)
export class BookKindEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  name: string;

  constructor(partial: Partial<BookKindEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {name} = this;
    if (name)
      this.name = name.trim().toLowerCase();
  }
}
