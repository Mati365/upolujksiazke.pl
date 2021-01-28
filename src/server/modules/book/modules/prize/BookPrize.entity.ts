import {
  Entity, Column,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';

@Entity(
  {
    name: 'book_prize',
  },
)
export class BookPrizeEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  name: string;

  @Column('text', {nullable: true})
  wikiUrl: string;

  constructor(partial: Partial<BookPrizeEntity>) {
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
