import {Column, Entity, OneToMany} from 'typeorm';
import {DatedRecordEntity} from '../../../database/DatedRecord.entity';
import {BookReleaseEntity} from '../release/BookRelease.entity';

@Entity(
  {
    name: 'book_publisher',
  },
)
export class BookPublisherEntity extends DatedRecordEntity {
  constructor(partial: Partial<BookPublisherEntity>) {
    super();
    Object.assign(this, partial);
  }

  @Column('text', {unique: true})
  name: string;

  @Column('text', {nullable: true})
  websiteURL: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('text', {nullable: true})
  address: string;

  @OneToMany(() => BookReleaseEntity, (entity) => entity.publisher)
  releases: BookReleaseEntity[];
}
