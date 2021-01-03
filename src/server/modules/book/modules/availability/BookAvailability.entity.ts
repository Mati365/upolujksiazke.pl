import {Column, Entity, JoinColumn, OneToOne} from 'typeorm';

import {RemoteRecordEntity} from '@server/modules/remote/entity';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';

@Entity(
  {
    name: 'book_availability',
  },
)
export class BookAvailabilityEntity extends DatedRecordEntity {
  @OneToOne(() => RemoteRecordEntity, {onDelete: 'CASCADE'})
  @JoinColumn()
  remote: RemoteRecordEntity;

  @Column('money', {nullable: true})
  price: number;

  constructor(partial: Partial<BookAvailabilityEntity>) {
    super();
    Object.assign(this, partial);
  }
}
