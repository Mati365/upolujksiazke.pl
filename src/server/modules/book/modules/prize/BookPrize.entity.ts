import {
  Entity, Column,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';

@Entity(
  {
    name: 'book_prize',
  },
)
export class BookPrizeEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
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
    if (name) {
      this.name = name.toLowerCase();
      this.parameterizedName ??= parameterize(name);
    }
  }
}
