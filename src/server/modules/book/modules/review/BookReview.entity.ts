import {
  Column, ManyToOne,
  JoinColumn, RelationId, Index,
  Check, BeforeUpdate, BeforeInsert,
} from 'typeorm';

import {normalizeHTML} from '@server/modules/importer/kinds/scrappers/helpers';

import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';
import {
  RemoteRecordEntity,
  RemoteRecordFields,
} from '@server/modules/remote/entity/RemoteRecord.entity';

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

  @Column('boolean', {default: false, nullable: true})
  includeInStats: boolean;

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

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {description} = this;

    if (description)
      this.description = normalizeHTML(description);
  }
}
