import {Expose, Type, Transform} from 'class-transformer';

import {BookType} from '@shared/enums';
import {BookCardRecord} from '@api/types/BookCard.record';
import {BaseSerializer} from './Base.serializer';
import {BookAuthorSerializer} from './BookAuthor.serializer';
import {BookCardReleaseSerializer} from './BookCardRelease.serializer';
import {BookVolumeSerializer} from './BookVolume.serializer';

import {safeParsePrice} from '../helpers';

export class BookCardSerializer extends BaseSerializer implements BookCardRecord {
  @Expose() defaultTitle: string;
  @Expose() parameterizedSlug: string;
  @Expose() avgRating: number;
  @Expose() totalRatings: number;
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

  @Expose()
  @Type(() => BookVolumeSerializer)
  volume: BookVolumeSerializer;
}
