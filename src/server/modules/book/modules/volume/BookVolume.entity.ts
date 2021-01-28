import {Entity, Column} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@Entity(
  {
    name: 'book_volume',
  },
)
export class BookVolumeEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  name: string;

  constructor(partial: Partial<BookReleaseEntity>) {
    super();
    Object.assign(this, partial);
  }
}
