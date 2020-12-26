import {
  Embedded, Entity, ManyToOne,
  OneToOne, Property,
} from '@mikro-orm/core';

import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {BookEntity} from '../book/Book.entity';

import {ScrapperMetadataEntity} from '../importer/modules/scrapper/entity';
import {ScrapperRemoteEntity} from '../importer/modules/scrapper/embeddables/ScrapperRemoteEntity.embeddable';

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

  @Embedded()
  remoteEntity!: ScrapperRemoteEntity;

  constructor(partial: Partial<BookReviewEntity>) {
    super();
    Object.assign(this, partial);
  }
}
