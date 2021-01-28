import {
  Entity, Column, ManyToOne,
  JoinColumn, RelationId,
} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookPublisherEntity} from '../publisher/BookPublisher.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@Entity(
  {
    name: 'book_series',
  },
)
export class BookSeriesEntity extends DatedRecordEntity {
  @Column('citext', {unique: true})
  name: string;

  @ManyToOne(
    () => BookPublisherEntity,
    (entity) => entity.series,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({name: 'publisherId'})
  publisher: BookPublisherEntity;

  @Column()
  @RelationId((entity: BookReleaseEntity) => entity.publisher)
  publisherId: number;

  constructor(partial: Partial<BookReleaseEntity>) {
    super();
    Object.assign(this, partial);
  }
}
