import {
  Entity, Column, ManyToMany,
  OneToOne, JoinColumn, RelationId,
} from 'typeorm';

import {Gender} from '@shared/types';
import {RemoteRecordEntity} from '@server/modules/remote/entity';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_reviewer',
  },
)
export class BookReviewerEntity extends DatedRecordEntity {
  @Column('text')
  name: string;

  @Column(
    {
      type: 'enum',
      enum: Gender,
      default: Gender.UNKNOWN,
    },
  )
  gender?: Gender;

  @ManyToMany(() => BookEntity, (book) => book.reviewers)
  books: BookEntity[];

  @OneToOne(() => RemoteRecordEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'remoteId'})
  remote: RemoteRecordEntity;

  @Column()
  @RelationId((entity: BookReviewerEntity) => entity.remote)
  remoteId: number;

  constructor(partial: Partial<BookReviewerEntity>) {
    super();
    Object.assign(this, partial);
  }
}
