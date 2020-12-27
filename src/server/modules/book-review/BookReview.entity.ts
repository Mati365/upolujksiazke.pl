import {
  Entity, Column,
  ManyToOne, OneToOne,
} from 'typeorm';

import {BookEntity} from '../book/Book.entity';
import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {ScrapperMetadataEntity, ScrapperRemoteEntity} from '../importer/modules/scrapper/entity';

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
  scrapperMetadata!: ScrapperMetadataEntity;

  @OneToOne(() => ScrapperRemoteEntity)
  remote: ScrapperRemoteEntity;

  constructor(partial: Partial<BookReviewEntity>) {
    super();
    Object.assign(this, partial);
  }
}
