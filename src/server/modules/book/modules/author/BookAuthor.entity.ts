import * as R from 'ramda';
import {
  Entity, Column, ManyToMany,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {truncateLevenshteinText} from '@server/common/helpers';
import {parameterize} from '@shared/helpers/parameterize';
import {normalizeHTML} from '@server/modules/importer/kinds/scrappers/helpers';

import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {BookEntity} from '../../entity/Book.entity';

export const reorderAuthorName = (name: string) => R.sortBy(
  R.identity,
  name.split(' '),
).join(' ');

@Entity(
  {
    name: 'book_author',
  },
)
export class BookAuthorEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
  name: string;

  @Column('text', {array: true, nullable: true})
  nameAliases: string[];

  @Column('text', {nullable: true})
  description: string;

  @ManyToMany(() => BookEntity, (book) => book.authors)
  books: BookEntity[];

  constructor(partial: Partial<BookAuthorEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {parameterizedName, name, description} = this;

    if (description)
      this.description = normalizeHTML(description);

    if (name)
      this.name = truncateLevenshteinText(name);

    if (!parameterizedName && this.name)
      this.parameterizedName = parameterize(reorderAuthorName(this.name));
  }
}
