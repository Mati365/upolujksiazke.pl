import {
  Entity, Column, ManyToOne,
  OneToOne, JoinColumn,
} from 'typeorm';

import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {ScrapperMetadataEntity, ScrapperRemoteEntity} from '../../../importer/modules/scrapper/entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_review',
  },
)
export class BookReviewEntity extends DatedRecordEntity {
  @Column('text')
  nick!: string;

  @Column('text')
  description!: string;

  @Column('smallint')
  rating: number;

  @ManyToOne(() => BookEntity, (book) => book.reviews)
  book!: BookEntity;

  @OneToOne(() => ScrapperMetadataEntity)
  @JoinColumn()
  scrapperMetadata!: ScrapperMetadataEntity;

  @OneToOne(() => ScrapperRemoteEntity)
  @JoinColumn()
  remote: ScrapperRemoteEntity;

  constructor(partial: Partial<BookReviewEntity>) {
    super();
    Object.assign(this, partial);
  }
}
