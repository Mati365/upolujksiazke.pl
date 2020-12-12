import {Entity, Property} from '@mikro-orm/core';
import {DatedRecordEntity} from '../database/DatedRecord.entity';

@Entity()
export class BookEntity extends DatedRecordEntity {
  @Property()
  title: string;
}
