import {Entity, ManyToOne, OneToOne, Property} from '@mikro-orm/core';

import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {BookEntity} from '../book/Book.entity';
import {ScrapperMetadataEntity} from '../importer/modules/scrapper/entity';

@Entity(
  {
    tableName: 'book_review',
  },
)
export class BookReviewEntity extends DatedRecordEntity {
  @Property()
  nick!: string;

  @Property(
    {
      columnType: 'text',
    },
  )
  description!: string;

  @Property(
    {
      columnType: 'smallint',
    },
  )
  rating: number;

  @ManyToOne(() => BookEntity)
  book!: BookEntity;

  @OneToOne(() => ScrapperMetadataEntity)
  scrapperMetadata!: ScrapperMetadataEntity;
}
