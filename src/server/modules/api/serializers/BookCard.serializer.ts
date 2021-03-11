import {Expose, Type} from 'class-transformer';

import {BookCardRecord} from '@api/types/BookCard.record';
import {BaseSerializer} from './Base.serializer';
import {BookAuthorSerializer} from './BookAuthor.serializer';
import {BookCardReleaseSerializer} from './BookCardRelease.serializer';

export class BookCardSerializer extends BaseSerializer implements BookCardRecord {
  @Expose() parameterizedSlug: string;
  @Expose() avgRating: number;
  @Expose() totalRatings: number;

  @Expose()
  @Type(() => BookAuthorSerializer)
  authors: BookAuthorSerializer[];

  @Expose()
  @Type(() => BookCardReleaseSerializer)
  primaryRelease: BookCardReleaseSerializer;
}
