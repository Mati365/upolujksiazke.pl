import {Expose, Type} from 'class-transformer';

import {BookFullInfoRecord} from '@api/types';
import {BookCardSerializer} from './BookCard.serializer';
import {BookCategorySerializer} from './BookCategory.serializer';
import {BookFullInfoReleaseSerializer} from './BookFullInfoRelease.serializer';
import {BookPrizeSerializer} from './BookPrize.serializer';
import {TagSerializer} from './Tag.serializer';

export class BookFullInfoSerializer extends BookCardSerializer implements BookFullInfoRecord {
  @Expose()
  originalPublishDate: string;

  @Expose()
  @Type(() => BookFullInfoReleaseSerializer)
  primaryRelease: BookFullInfoReleaseSerializer;

  @Expose()
  @Type(() => TagSerializer)
  tags: TagSerializer[];

  @Expose()
  @Type(() => BookCategorySerializer)
  categories: BookCategorySerializer[];

  @Expose()
  @Type(() => BookFullInfoReleaseSerializer)
  releases: BookFullInfoReleaseSerializer[];

  @Expose()
  @Type(() => BookPrizeSerializer)
  prizes: BookPrizeSerializer[];
}
