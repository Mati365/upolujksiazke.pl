import {
  Entity, Column, ManyToMany,
  OneToOne, JoinColumn, RelationId,
  OneToMany, Unique, ManyToOne, Index,
} from 'typeorm';

import {Gender} from '@shared/types';
import {RemoteRecordEntity, RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';

import {BookEntity} from '../../Book.entity';
import {BookReviewEntity} from '../review/BookReview.entity';

@Entity(
  {
    name: 'book_reviewer',
  },
)
@Unique('book_reviewer_unique_website_name', ['name', 'website'])
@Index(['website'])
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

  @OneToMany(() => BookReviewEntity, (entity) => entity.reviewer)
  reviews: BookReviewEntity[];

  @OneToOne(() => RemoteRecordEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'remoteId'})
  remote: RemoteRecordEntity;

  @Column()
  @RelationId((entity: BookReviewerEntity) => entity.remote)
  remoteId: number;

  @ManyToOne(() => RemoteWebsiteEntity)
  @JoinColumn({name: 'websiteId'})
  website: RemoteWebsiteEntity;

  @Column()
  @RelationId((entity: RemoteRecordEntity) => entity.website)
  websiteId: number;

  constructor(partial: Partial<BookReviewerEntity>) {
    super();
    Object.assign(this, partial);
  }
}
