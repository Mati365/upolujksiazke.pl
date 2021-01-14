import {
  Entity, Column, ManyToOne,
  OneToOne, JoinColumn, RelationId, Index,
} from 'typeorm';

import {RemoteRecordEntity} from '@server/modules/remote/entity';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';

import {BookReviewerEntity} from '../reviewer/BookReviewer.entity';
import {BookEntity} from '../../Book.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@Entity(
  {
    name: 'book_review',
  },
)
@Index(['book'])
export class BookReviewEntity extends DatedRecordEntity {
  @Column('timestamp')
  publishDate: Date;

  @ManyToOne(() => BookReviewerEntity, (entity) => entity.reviews)
  reviewer: BookReviewerEntity;

  @Column('text')
  description: string;

  @Column('smallint', {nullable: true})
  rating: number;

  @ManyToOne(() => BookEntity, (book) => book.reviews)
  book: BookEntity;

  @OneToOne(() => RemoteRecordEntity)
  @JoinColumn()
  remote: RemoteRecordEntity;

  @Column(() => VotingStatsEmbeddable)
  stats: VotingStatsEmbeddable;

  @ManyToOne(() => BookReleaseEntity, (entity) => entity.reviews, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'releaseId'})
  release: BookReleaseEntity;

  @Column()
  @RelationId((entity: BookReviewEntity) => entity.release)
  releaseId: number;

  constructor(partial: Partial<BookReviewEntity>) {
    super();
    Object.assign(this, partial);
  }
}
