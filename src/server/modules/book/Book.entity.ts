import * as R from 'ramda';
import {Transform} from 'class-transformer';
import {
  Entity, Column,
  ManyToMany, OneToMany, JoinTable,
  JoinColumn, ManyToOne, RelationId,
} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';

import {Language} from '@server/constants/language';
import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {TagEntity} from '../tag/Tag.entity';
import {BookAuthorEntity} from './modules/author/BookAuthor.entity';
import {BookCategoryEntity} from './modules/category/BookCategory.entity';
import {BookReviewEntity} from './modules/review/BookReview.entity';
import {BookReleaseEntity} from './modules/release/BookRelease.entity';
import {BookVolumeEntity} from './modules/volume/BookVolume.entity';
import {BookAvailabilityEntity} from './modules/availability/BookAvailability.entity';
import {BookSeriesEntity} from './modules/series/BookSeries.entity';
import {BookPrizeEntity} from './modules/prize/BookPrize.entity';
import {BookKindEntity} from './modules/kind/BookKind.entity';
import {CreateBookDto} from './dto/CreateBook.dto';

@Entity(
  {
    name: 'book',
  },
)
export class BookEntity extends DatedRecordEntity {
  @Column('citext', {unique: true, nullable: true})
  parameterizedSlug: string;

  @Column('citext')
  defaultTitle: string;

  @Column(
    {
      type: 'enum',
      enum: Language,
      nullable: true,
    },
  )
  originalLang: Language;

  @Column('citext', {nullable: true})
  originalTitle: string;

  @Column('text', {nullable: true})
  originalPublishDate: string;

  @JoinTable()
  @ManyToMany(() => BookAuthorEntity, (author) => author.books)
  authors: BookAuthorEntity[];

  @JoinTable()
  @ManyToMany(
    () => BookCategoryEntity,
    (categoryEntity) => categoryEntity.books,
    {
      cascade: true,
    },
  )
  categories: BookCategoryEntity[];

  @OneToMany(() => BookReviewEntity, (review) => review.book)
  reviews: BookReviewEntity[];

  @Transform(R.map(R.prop('name')) as any)
  @JoinTable()
  @ManyToMany(
    () => TagEntity,
    {
      cascade: true,
    },
  )
  tags: TagEntity[];

  @OneToMany(
    () => BookReleaseEntity,
    (entity) => entity.book,
    {
      cascade: true,
    },
  )
  releases: BookReleaseEntity[];

  @OneToMany(() => BookAvailabilityEntity, (entity) => entity.book)
  availability: BookAvailabilityEntity[];

  @ManyToOne(() => BookVolumeEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'volumeId'})
  volume: BookVolumeEntity;

  @Column({nullable: true})
  @RelationId((entity: BookEntity) => entity.volume)
  volumeId: number;

  @JoinTable()
  @ManyToMany(
    () => BookSeriesEntity,
    {
      cascade: true,
    },
  )
  series: BookSeriesEntity[];

  @JoinTable()
  @ManyToMany(
    () => BookPrizeEntity,
    {
      cascade: true,
    },
  )
  prizes: BookPrizeEntity[];

  @ManyToOne(() => BookKindEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'kindId'})
  kind: BookKindEntity;

  @Column({nullable: true})
  @RelationId((entity: BookEntity) => entity.kind)
  kindId: number;

  constructor(partial: Partial<BookEntity>) {
    super();
    Object.assign(this, partial);
  }

  static genSlug({title, authors}: CreateBookDto) {
    return parameterize(`${title}-${R.sortBy(R.prop('name'), authors)[0]?.name || 'unknown'}`);
  }
}
