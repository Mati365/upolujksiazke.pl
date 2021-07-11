import {
  Entity, Column, ManyToMany,
  BeforeInsert, BeforeUpdate,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../entity/Book.entity';

@Entity(
  {
    name: 'book_category',
  },
)
@Index(['parentCategory'])
@Index(['root'])
export class BookCategoryEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
  name: string;

  @Column('text', {array: true, nullable: true})
  nameAliases: string[];

  @ManyToMany(() => BookEntity, (book) => book.categories)
  books: BookEntity[];

  @Column('int', {nullable: true})
  promotion: number;

  @Column('boolean', {default: false, nullable: true})
  promotionLock: boolean;

  @Column('boolean', {nullable: true})
  root: boolean;

  @Column('int', {nullable: true})
  parentCategoryId: number;

  @ManyToOne(() => BookCategoryEntity, (category) => category.id, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'parentCategoryId'})
  parentCategory: BookCategoryEntity;

  @Column('text', {nullable: true})
  icon: string;

  constructor(partial: Partial<BookCategoryEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {name} = this;
    if (name) {
      this.name = name.trim().toLowerCase();
      this.parameterizedName ??= parameterize(name);
    }
  }
}
