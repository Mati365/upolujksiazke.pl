import {Expose, Type} from 'class-transformer';

import {BookFullInfoRecord} from '@api/types';
import {BookCardSerializer} from './BookCard.serializer';
import {BookTagSerializer} from './BookTag.serializer';
import {BookCategorySerializer} from './BookCategory.serializer';
import {BookFullInfoReleaseSerializer} from './BookFullInfoRelease.serializer';

export class BookFullInfoSerializer extends BookCardSerializer implements BookFullInfoRecord {
  @Expose()
  @Type(() => BookFullInfoReleaseSerializer)
  primaryRelease: BookFullInfoReleaseSerializer;

  @Expose()
  @Type(() => BookTagSerializer)
  tags: BookTagSerializer[];

  @Expose()
  @Type(() => BookCategorySerializer)
  categories: BookCategorySerializer[];

  @Expose()
  @Type(() => BookFullInfoReleaseSerializer)
  releases: BookFullInfoReleaseSerializer[];
}
