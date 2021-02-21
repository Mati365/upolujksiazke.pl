import {
  Entity, Column,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@Entity(
  {
    name: 'book_series',
  },
)
export class BookSeriesEntity extends DatedRecordEntity {
  @Column('citext')
  name: string;

  @Column('text', {unique: true})
  parameterizedName: string;

  constructor(partial: Partial<BookReleaseEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {parameterizedName, name} = this;
    if (!parameterizedName && name)
      this.parameterizedName = parameterize(name);
  }
}
