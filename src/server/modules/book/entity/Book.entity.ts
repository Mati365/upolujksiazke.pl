import * as R from 'ramda';
import {Transform} from 'class-transformer';
import {
  Entity, Column, OneToOne,
  ManyToMany, OneToMany, JoinTable,
  JoinColumn, ManyToOne, RelationId, Index,
  BeforeInsert, BeforeUpdate,
} from 'typeorm';

import {truncateLevenshteinText} from '@server/common/helpers';

import {Language} from '@shared/enums';
import {TrackScrappersList} from '@server/modules/remote/entity/RemoteRecord.entity';
import {DatedRecordEntity} from '../../database/DatedRecord.entity';
import {TagEntity} from '../../tag/Tag.entity';
import {BookAuthorEntity} from '../modules/author/BookAuthor.entity';
import {BookCategoryEntity} from '../modules/category/BookCategory.entity';
import {BookReviewEntity} from '../modules/review/entity/BookReview.entity';
import {BookReleaseEntity, BookType} from '../modules/release/BookRelease.entity';
import {BookVolumeEntity} from '../modules/volume/BookVolume.entity';
import {BookSeriesEntity} from '../modules/series/BookSeries.entity';
import {BookPrizeEntity} from '../modules/prize/BookPrize.entity';
import {BookKindEntity} from '../modules/kind/BookKind.entity';
import {BookEraEntity} from '../modules/era/BookEra.entity';
import {BookGenreEntity} from '../modules/genre/BookGenre.entity';
import {BookSummaryEntity} from '../modules/summary/entity';
import {SchoolBookEntity} from './SchoolBook.entity';

@Entity(
  {
    name: 'book',
  },
)
@Index(['hierarchicSeries'])
@Index(['primaryCategoryId'])
export class BookEntity extends DatedRecordEntity implements TrackScrappersList {
  @Column('text', {unique: true, nullable: true})
  parameterizedSlug: string;

  @Column('citext')
  defaultTitle: string;

  @OneToOne(
    () => SchoolBookEntity,
    (entity) => entity.book,
    {
      cascade: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({name: 'schoolBookId'})
  schoolBook: SchoolBookEntity;

  @Column({nullable: true})
  @RelationId((entity: BookEntity) => entity.schoolBook)
  schoolBookId: number;

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

  @Column('int', {nullable: true})
  originalPublishYear: number;

  @Column('text', {nullable: true})
  nonHTMLDescription: string; // only text, without html tags

  @Column('text', {nullable: true})
  description: string; // with html tags but without tags links

  @Column('text', {nullable: true})
  taggedDescription: string; // html + tags links

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

  @JoinTable()
  @ManyToMany(
    () => BookEraEntity,
    (eraEntity) => eraEntity.books,
    {
      cascade: true,
    },
  )
  era: BookGenreEntity[];

  @JoinTable()
  @ManyToMany(
    () => BookGenreEntity,
    (genreEntity) => genreEntity.books,
    {
      cascade: true,
    },
  )
  genre: BookGenreEntity[];

  @OneToMany(() => BookReviewEntity, (review) => review.book)
  reviews: BookReviewEntity[];

  @OneToMany(() => BookSummaryEntity, (summary) => summary.book)
  summaries: BookSummaryEntity[];

  @Transform(R.map(R.prop('name')) as any)
  @JoinTable()
  @ManyToMany(
    () => TagEntity,
    {
      cascade: true,
    },
  )
  tags: TagEntity[];

  @OneToOne(() => BookReleaseEntity, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'primaryReleaseId'})
  primaryRelease: BookReleaseEntity;

  @Column({nullable: true})
  @RelationId((entity: BookEntity) => entity.primaryRelease)
  primaryReleaseId: number;

  @OneToMany(
    () => BookReleaseEntity,
    (entity) => entity.book,
    {
      cascade: true,
    },
  )
  releases: BookReleaseEntity[];

  @ManyToOne(() => BookSeriesEntity, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'hierarchicSeriesId'})
  hierarchicSeries: BookSeriesEntity;

  @Column({nullable: true})
  @RelationId((entity: BookEntity) => entity.hierarchicSeries)
  hierarchicSeriesId: number;

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

  /** <AUTOGENERATED COLUMNS> */
  @Column('int', {nullable: true})
  primaryCategoryId: number;

  @ManyToOne(() => BookCategoryEntity, (category) => category.id, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'primaryCategoryId'})
  primaryCategory: BookCategoryEntity;

  @Column('int', {array: true, nullable: true})
  scrappersIds: number[];

  @Column('float', {nullable: true})
  avgRating: number;

  @Column('bigint', {nullable: true})
  rankingScore: number;

  @Column('integer', {nullable: true})
  totalRatings: number;

  @Column('integer', {nullable: true})
  totalTextReviews: number;

  @Column(
    'decimal',
    {
      precision: 5,
      scale: 2,
      nullable: true,
    },
  )
  lowestPrice: number;

  @Column(
    'decimal',
    {
      precision: 5,
      scale: 2,
      nullable: true,
    },
  )
  highestPrice: number;

  @Column(
    {
      type: 'enum',
      enum: BookType,
      array: true,
      default: [],
    },
  )
  allTypes: BookType[];
  /** </AUTOGENERATED COLUMNS> */

  constructor(partial?: Partial<BookEntity>) {
    super();

    if (partial)
      Object.assign(this, partial);
  }

  @BeforeInsert()
  @BeforeUpdate()
  transformFields() {
    const {defaultTitle, originalTitle} = this;

    this.defaultTitle = truncateLevenshteinText(defaultTitle);
    this.originalTitle = truncateLevenshteinText(originalTitle);
  }
}
