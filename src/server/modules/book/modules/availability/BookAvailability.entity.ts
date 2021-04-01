import * as R from 'ramda';
import {
  BeforeInsert,
  Column, Index, JoinColumn,
  ManyToOne, RelationId, Unique,
} from 'typeorm';

import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity/RemoteRecord.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

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
    withUniqConstraint: false,
  },
)
@Index(['releaseId'])
@Unique(
  'book_availability_unique_remote_website',
  ['website', 'remoteId', 'release'],
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

  @Column('boolean', {default: true, nullable: true})
  inStock: boolean;

  @ManyToOne(() => BookReleaseEntity, (entity) => entity.availability, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'releaseId'})
  release: BookReleaseEntity;

  @Column()
  @RelationId((entity: BookAvailabilityEntity) => entity.release)
  releaseId: number;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<BookAvailabilityEntity>) {
    super(partial);
  }

  @BeforeInsert()
  transformFields() {
    if (R.isNil(this.price))
      this.inStock = false;
  }
}
