import {
  Entity, Column, ManyToMany,
  BeforeInsert, BeforeUpdate,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookEntity} from '../../Book.entity';

@Entity(
  {
    name: 'book_category',
  },
)
@Index(['parentCategory'])
export class BookCategoryEntity extends DatedRecordEntity {
  @Column('text', {unique: true})
  parameterizedName: string;

  @Column('citext')
  name: string;

  @ManyToMany(() => BookEntity, (book) => book.categories)
  books: BookEntity[];

  @Column('int', {nullable: true})
  promotion: number;

  @Column('boolean', {default: false, nullable: true})
  promotionLock: boolean;

  @Column({nullable: true})
  parentCategoryId: number;

  @ManyToOne(() => BookCategoryEntity, (category) => category.id)
  @JoinColumn({name: 'parentCategoryId'})
  parentCategory: BookCategoryEntity;

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
