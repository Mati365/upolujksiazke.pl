import {
  Entity, Column, JoinColumn, OneToMany,
  ManyToOne, RelationId, Index,
} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';
import {BookAvailabilityEntity} from '../availability/BookAvailability.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@Entity(
  {
    name: 'book_volume',
  },
)
@Index(['book'])
export class BookVolumeEntity extends DatedRecordEntity {
  @ManyToOne(() => BookEntity, (entity) => entity.volumes, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'bookId'})
  book: BookEntity;

  @Column()
  @RelationId((entity: BookVolumeEntity) => entity.book)
  bookId: number;

  @OneToMany(() => BookReleaseEntity, (entity) => entity.volume)
  release: BookReleaseEntity;

  @Column('citext', {unique: true})
  name: string;

  @OneToMany(() => BookAvailabilityEntity, (entity) => entity.volume)
  availability: BookAvailabilityEntity[];

  constructor(partial: Partial<BookReleaseEntity>) {
    super();
    Object.assign(this, partial);
  }
}
