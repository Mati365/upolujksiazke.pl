import {Entity, Column} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';

@Entity(
  {
    name: 'book_volume',
  },
)
export class BookVolumeEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  name: string;

  constructor(partial: Partial<BookVolumeEntity>) {
    super();
    Object.assign(this, partial);
  }
}
