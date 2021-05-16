import {Expose, Type} from 'class-transformer';

import {BookFullInfoRecord} from '@api/types';
import {BookCardSerializer} from './BookCard.serializer';
import {BookCategorySerializer} from './BookCategory.serializer';
import {BookFullInfoReleaseSerializer} from './BookFullInfoRelease.serializer';
import {BookPrizeSerializer} from './BookPrize.serializer';
import {BookReviewSerializer} from './BookReview.serializer';
import {BookEraSerializer} from './BookEra.serializer';
import {BookGenreSerializer} from './BookGenre.serializer';
import {BookSummarySerializer} from './BookSummary.serializer';
import {SchoolBookSerializer} from './SchoolBook.serializer';
import {SeriesBookSerializer} from './SeriesBook.serializer';
import {TagSerializer} from './Tag.serializer';

export class BookFullInfoSerializer extends BookCardSerializer implements BookFullInfoRecord {
  @Expose() taggedDescription: string;

  @Expose()
  originalPublishDate: string;

  @Expose()
  @Type(() => BookFullInfoReleaseSerializer)
  primaryRelease: BookFullInfoReleaseSerializer;

  @Expose()
  @Type(() => SchoolBookSerializer)
  schoolBook: SchoolBookSerializer;

  @Expose()
  @Type(() => TagSerializer)
  tags: TagSerializer[];

  @Expose()
  @Type(() => BookCategorySerializer)
  categories: BookCategorySerializer[];

  @Expose()
  @Type(() => BookCategorySerializer)
  primaryCategory: BookCategorySerializer;

  @Expose()
  @Type(() => BookEraSerializer)
  era: BookEraSerializer[];

  @Expose()
  @Type(() => BookGenreSerializer)
  genre: BookGenreSerializer[];

  @Expose()
  @Type(() => BookFullInfoReleaseSerializer)
  releases: BookFullInfoReleaseSerializer[];

  @Expose()
  @Type(() => BookSummarySerializer)
  summaries: BookSummarySerializer[];

  @Expose()
  @Type(() => BookPrizeSerializer)
  prizes: BookPrizeSerializer[];

  @Expose()
  @Type(() => BookReviewSerializer)
  reviews: BookReviewSerializer[];

  @Expose()
  @Type(() => SeriesBookSerializer)
  hierarchy: SeriesBookSerializer[];
}
