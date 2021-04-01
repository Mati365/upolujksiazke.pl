import {Expose, Type, Transform} from 'class-transformer';

import {BookType} from '@shared/enums';
import {BookCardRecord} from '@api/types/BookCard.record';
import {BookAuthorSerializer} from './BookAuthor.serializer';
import {BookCardReleaseSerializer} from './BookCardRelease.serializer';
import {SeriesBookSerializer} from './SeriesBook.serializer';

import {safeParsePrice} from '../helpers';

export class BookCardSerializer extends SeriesBookSerializer implements BookCardRecord {
  @Expose() allTypes: BookType[];

  @Expose()
  @Transform(({value}) => safeParsePrice(value))
  lowestPrice: number;

  @Expose()
  @Transform(({value}) => safeParsePrice(value))
  highestPrice: number;

  @Expose()
  @Type(() => BookAuthorSerializer)
  authors: BookAuthorSerializer[];

  @Expose()
  @Type(() => BookCardReleaseSerializer)
  primaryRelease: BookCardReleaseSerializer;
}
