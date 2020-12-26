import {
  Collection, Embedded, Entity,
  Enum, ManyToMany, Property,
} from '@mikro-orm/core';

import {Gender} from '@shared/types';

import {BookEntity} from '../book/Book.entity';
import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {ScrapperRemoteEntity} from '../importer/modules/scrapper/embeddables/ScrapperRemoteEntity.embeddable';

@Entity(
  {
    tableName: 'book_reviewer',
  },
)
export class BookReviewerEntity extends DatedRecordEntity {
  @Property()
  name: string;

  @Enum(() => Gender)
  gender?: Gender;

  @ManyToMany(() => BookEntity, (book) => book.reviewers)
  books = new Collection<BookEntity>(this);

  @Embedded()
  remoteEntity!: ScrapperRemoteEntity;
}
