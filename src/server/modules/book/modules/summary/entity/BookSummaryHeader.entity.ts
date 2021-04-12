import {
  Entity, Column, Unique,
  BeforeInsert, BeforeUpdate,
  ManyToOne, JoinColumn, RelationId, Index,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {BookSummaryEntity} from './BookSummary.entity';

@Entity(
  {
    name: 'book_summary_header',
  },
)
@Index(['summary'])
@Unique(
  'book_summary_header_unique_title_url',
  ['title', 'url'],
)
export class BookSummaryHeaderEntity extends DatedRecordEntity {
  @Column('text')
  parameterizedTitle: string;

  @Column('citext')
  title: string;

  @Column('text')
  url: string;

  @ManyToOne(() => BookSummaryEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'summaryId'})
  summary: BookSummaryEntity;

  @Column({nullable: true})
  @RelationId((entity: BookSummaryHeaderEntity) => entity.summary)
  summaryId: number;

  constructor(partial: Partial<BookSummaryHeaderEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {title} = this;
    if (title) {
      this.title = title.trim().toLowerCase();
      this.parameterizedTitle ??= parameterize(title);
    }
  }
}
