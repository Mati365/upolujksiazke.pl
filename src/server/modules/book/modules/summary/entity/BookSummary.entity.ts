import {
  Column, Entity, Index, OneToOne,
  JoinColumn, ManyToOne, RelationId, OneToMany,
} from 'typeorm';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {BookEntity} from '@server/modules/book/entity/Book.entity';
import {RemoteArticleEntity} from '@server/modules/remote/entity/RemoteArticle.entity';
import {BookSummaryHeaderEntity} from './BookSummaryHeader.entity';

@Entity(
  {
    name: 'book_summary',
  },
)
@Index(['book'])
export class BookSummaryEntity extends DatedRecordEntity {
  @ManyToOne(() => BookEntity)
  @JoinColumn({name: 'bookId'})
  book: BookEntity;

  @Column()
  @RelationId((entity: BookSummaryEntity) => entity.book)
  bookId: number;

  @OneToOne(() => RemoteArticleEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'articleId'})
  article: RemoteArticleEntity;

  @Column({nullable: true})
  @RelationId((entity: BookSummaryEntity) => entity.article)
  articleId: number;

  @OneToMany(() => BookSummaryHeaderEntity, (entity) => entity.summary)
  headers: BookSummaryHeaderEntity[];

  constructor(partial: Partial<BookSummaryEntity>) {
    super();
    Object.assign(this, partial);
  }
}
