import {Expose, Type, Transform} from 'class-transformer';

import {BookAvailabilityRecord} from '@api/types/BookAvailability.record';
import {BaseSerializer} from './Base.serializer';
import {WebsiteSerializer} from './Website.serializer';

import {safeParsePrice} from '../helpers';

export class BookAvailabilitySerializer extends BaseSerializer implements BookAvailabilityRecord {
  @Expose()
  @Transform(({value}) => safeParsePrice(value))
  prevPrice: number;

  @Expose()
  @Transform(({value}) => safeParsePrice(value))
  price: number;

  @Expose() avgRating: number;
  @Expose() totalRatings: number;
  @Expose() inStock: boolean;

  @Expose()
  @Type(() => WebsiteSerializer)
  website: WebsiteSerializer;
}
