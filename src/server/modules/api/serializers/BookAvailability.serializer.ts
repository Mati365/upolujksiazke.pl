import {Expose, Type} from 'class-transformer';

import {BookAvailabilityRecord} from '@api/types/BookAvailability.record';
import {BaseSerializer} from './Base.serializer';
import {WebsiteSerializer} from './Website.serializer';

export class BookAvailabilitySerializer extends BaseSerializer implements BookAvailabilityRecord {
  @Expose() prevPrice: number;
  @Expose() price: number;
  @Expose() avgRating: number;
  @Expose() totalRatings: number;
  @Expose() inStock: boolean;

  @Expose()
  @Type(() => WebsiteSerializer)
  website: WebsiteSerializer;
}
