import {
  Entity, Column,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {DatedRecordEntity} from '../database/DatedRecord.entity';

@Entity(
  {
    name: 'tag',
  },
)
export class TagEntity extends DatedRecordEntity {
  @Column('citext')
  name: string;

  @Column('text', {unique: true})
  parameterizedName: string;

  constructor(partial: Partial<TagEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {name} = this;
    if (name) {
      this.name = name.toLowerCase();
      this.parameterizedName ??= parameterize(name);
    }
  }
}
