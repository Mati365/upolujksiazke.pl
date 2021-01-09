import {
  Entity, Column, ManyToOne,
  OneToOne, JoinColumn,
} from 'typeorm';

import {RemoteRecordEntity} from '@server/modules/remote/entity';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {ScrapperMetadataEntity} from '@scrapper/entity';
import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';

import {BookReviewerEntity} from '../reviewer/BookReviewer.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_review',
  },
)
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

  @OneToOne(() => ScrapperMetadataEntity)
  @JoinColumn()
  scrapperMetadata: ScrapperMetadataEntity;

  @OneToOne(() => RemoteRecordEntity)
  @JoinColumn()
  remote: RemoteRecordEntity;

  @Column(() => VotingStatsEmbeddable)
  stats: VotingStatsEmbeddable;

  constructor(partial: Partial<BookReviewEntity>) {
    super();
    Object.assign(this, partial);
  }
}
