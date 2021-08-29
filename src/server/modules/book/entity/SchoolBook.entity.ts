import {Entity, Column, OneToOne} from 'typeorm';

import {BookSchoolLevel} from '@shared/enums/school';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';
import {BookEntity} from './Book.entity';

@Entity(
  {
    name: 'school_book',
  },
)
export class SchoolBookEntity extends DatedRecordEntity {
  @Column(
    {
      type: 'enum',
      enum: BookSchoolLevel,
      nullable: true,
    },
  )
  classLevel: BookSchoolLevel;

  @Column('boolean', {nullable: true})
  obligatory: boolean;

  @OneToOne(() => BookEntity, (entity) => entity.schoolBook)
  book: BookEntity;

  constructor(partial: Partial<SchoolBookEntity>) {
    super();

    Object.assign(this, partial);
  }
}
