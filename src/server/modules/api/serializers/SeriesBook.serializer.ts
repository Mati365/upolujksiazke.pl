import {Expose, Type} from 'class-transformer';

import {SeriesBookRecord} from '@api/types/SeriesBook.record';
import {BaseSerializer} from './Base.serializer';
import {BookVolumeSerializer} from './BookVolume.serializer';

export class SeriesBookSerializer extends BaseSerializer implements SeriesBookRecord {
  @Expose() defaultTitle: string;
  @Expose() parameterizedSlug: string;
  @Expose() avgRating: number;
  @Expose() totalRatings: number;

  @Expose()
  @Type(() => BookVolumeSerializer)
  volume: BookVolumeSerializer;
}
