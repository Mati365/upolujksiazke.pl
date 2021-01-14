import {
  Column, Entity, JoinColumn,
  ManyToOne, OneToOne, RelationId,
} from 'typeorm';

import {RemoteRecordEntity} from '@server/modules/remote/entity';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';
import {BookVolumeEntity} from '../volume/BookVolume.entity';

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
  prevPrice: number;

  @Column('money', {nullable: true})
  price: number;

  @Column('smallint', {nullable: true})
  avgRating: number;

  @Column('integer', {default: 0})
  totalRatings: number;

  @ManyToOne(() => BookEntity, (entity) => entity.availability, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'bookId'})
  book: BookEntity;

  @Column({nullable: true})
  @RelationId((entity: BookAvailabilityEntity) => entity.book)
  bookId: number;

  @ManyToOne(() => BookVolumeEntity, (entity) => entity.availability, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'volumeId'})
  volume: BookVolumeEntity;

  @Column({nullable: true})
  @RelationId((entity: BookAvailabilityEntity) => entity.volume)
  volumeId: number;

  constructor(partial: Partial<BookAvailabilityEntity>) {
    super();
    Object.assign(this, partial);
  }
}
