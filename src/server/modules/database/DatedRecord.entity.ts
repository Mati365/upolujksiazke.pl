import {Property, PrimaryKey} from '@mikro-orm/core';

export class DatedRecordEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date = new Date;

  @Property(
    {
      onUpdate: () => new Date,
    },
  )
  updatedAt: Date = new Date;
}
