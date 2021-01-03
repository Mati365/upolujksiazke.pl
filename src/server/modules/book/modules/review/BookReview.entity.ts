import {
  Entity, Column, ManyToOne,
  OneToOne, JoinColumn,
} from 'typeorm';

import {RemoteRecordEntity} from '@server/modules/remote/entity';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {ScrapperMetadataEntity} from '@server/modules/importer/modules/scrapper/entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_review',
  },
)
export class BookReviewEntity extends DatedRecordEntity {
  @Column('text')
  nick: string;

  @Column('text')
  description: string;

  @Column('smallint')
  rating: number;

  @ManyToOne(() => BookEntity, (book) => book.reviews)
  book: BookEntity;

  @OneToOne(() => ScrapperMetadataEntity)
  @JoinColumn()
  scrapperMetadata: ScrapperMetadataEntity;

  @OneToOne(() => RemoteRecordEntity)
  @JoinColumn()
  remote: RemoteRecordEntity;

  constructor(partial: Partial<BookReviewEntity>) {
    super();
    Object.assign(this, partial);
  }
}
