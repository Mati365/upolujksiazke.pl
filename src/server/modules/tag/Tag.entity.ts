import {
  Entity, Column, PrimaryGeneratedColumn,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {DatedRecordEntity} from '../database/DatedRecord.entity';

@Entity(
  {
    name: 'tag',
  },
)
export class TagEntity extends DatedRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(
    {
      type: 'varchar',
      length: 60,
      unique: true,
    },
  )
  name: string;

  constructor(partial: Partial<TagEntity>) {
    super();
    Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {name} = this;
    if (name)
      this.name = name.toLowerCase();
  }
}
