import {
  Column, Index, JoinColumn,
  ManyToOne, RelationId, Unique,
} from 'typeorm';

import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity/RemoteRecord.entity';
import {BookEntity} from '../../Book.entity';
import {BookVolumeEntity} from '../volume/BookVolume.entity';

@RemoteRecordEntity(
  {
    name: 'book_availability',
  },
)
@Index(['book'])
@Unique(
  'book_availability_unique_book_volume_website',
  ['book', 'volume', 'website'],
)
export class BookAvailabilityEntity extends RemoteRecordFields {
  @Column(
    'decimal',
    {
      precision: 5,
      scale: 2,
      nullable: true,
    },
  )
  prevPrice: number;

  @Column(
    'decimal',
    {
      precision: 5,
      scale: 2,
      nullable: true,
    },
  )
  price: number;

  @Column('smallint', {nullable: true})
  avgRating: number;

  @Column('integer', {nullable: true})
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

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<BookAvailabilityEntity>) {
    super(partial);
  }
}
