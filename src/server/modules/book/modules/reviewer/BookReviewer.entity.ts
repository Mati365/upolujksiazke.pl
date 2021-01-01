import {
  Entity, Column, ManyToMany,
  OneToOne, JoinColumn, RelationId,
} from 'typeorm';

import {Gender} from '@shared/types';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {ScrapperRemoteEntity} from '../../../importer/modules/scrapper/entity';
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

  @OneToOne(() => ScrapperRemoteEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'remoteId'})
  remote: ScrapperRemoteEntity;

  @Column()
  @RelationId((entity: BookReviewerEntity) => entity.remote)
  remoteId: number;

  constructor(partial: Partial<BookReviewerEntity>) {
    super();
    Object.assign(this, partial);
  }
}
