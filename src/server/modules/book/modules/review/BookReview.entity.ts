import {
  Column, ManyToOne,
  JoinColumn, RelationId, Index, Check,
} from 'typeorm';

import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity/RemoteRecord.entity';
import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';

import {BookReviewerEntity} from '../reviewer/BookReviewer.entity';
import {BookEntity} from '../../Book.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@RemoteRecordEntity(
  {
    name: 'book_review',
  },
)
@Index(['book'])
@Check('"description" <> null OR "rating" <> null')
export class BookReviewEntity extends RemoteRecordFields {
  @Column('timestamp')
  publishDate: Date;

  @ManyToOne(() => BookReviewerEntity, (entity) => entity.reviews)
  @JoinColumn({name: 'reviewerId'})
  reviewer: BookReviewerEntity;

  @Column()
  @RelationId((entity: BookReviewEntity) => entity.reviewer)
  reviewerId: number;

  @Column('text', {nullable: true})
  description: string;

  @Column('smallint', {nullable: true})
  rating: number;

  @ManyToOne(() => BookEntity, (book) => book.reviews)
  @JoinColumn({name: 'bookId'})
  book: BookEntity;

  @Column()
  @RelationId((entity: BookReviewEntity) => entity.book)
  bookId: number;

  @Column(() => VotingStatsEmbeddable)
  stats: VotingStatsEmbeddable;

  @ManyToOne(() => BookReleaseEntity, (entity) => entity.reviews, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'releaseId'})
  release: BookReleaseEntity;

  @Column({nullable: true})
  @RelationId((entity: BookReviewEntity) => entity.release)
  releaseId: number;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<BookReviewEntity>) {
    super(partial);
  }
}
