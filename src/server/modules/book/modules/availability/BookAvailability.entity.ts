import {
  Column, Index, JoinColumn,
  ManyToOne, RelationId, Unique,
} from 'typeorm';

import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity/RemoteRecord.entity';
import {BookEntity} from '../../Book.entity';

/**
 * @todo Add book type to unique
 *
 * @export
 * @class BookAvailabilityEntity
 * @extends {RemoteRecordFields}
 */
@RemoteRecordEntity(
  {
    name: 'book_availability',
  },
)
@Index(['book'])
@Unique(
  'book_availability_unique_book_website',
  ['book', 'website'],
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

  @Column('float', {nullable: true})
  avgRating: number;

  @Column('integer', {nullable: true})
  totalRatings: number;

  @ManyToOne(() => BookEntity, (entity) => entity.availability, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'bookId'})
  book: BookEntity;

  @Column({nullable: true})
  @RelationId((entity: BookAvailabilityEntity) => entity.book)
  bookId: number;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<BookAvailabilityEntity>) {
    super(partial);
  }
}
